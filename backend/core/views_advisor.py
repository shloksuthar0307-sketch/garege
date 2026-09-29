from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import (
    Vehicle, ServiceOrder, Appointment, Invoice, 
    VehicleInspection, Estimate, EstimateItem, CustomerCommunication, FollowUpTask, VehicleDamage, Conversation, Message
)
from .serializers_advisor import (
    AdvisorServiceOrderSerializer, AdvisorAppointmentSerializer,
    VehicleInspectionSerializer, EstimateSerializer, 
    CustomerCommunicationSerializer, FollowUpTaskSerializer, VehicleDamageSerializer, TechnicianUserSerializer,
    ConversationSerializer, MessageSerializer
)
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def advisor_dashboard_stats(request):
    # This should be filtered by the advisor's branch in a real multi-tenant system
    # For now, we return aggregate metrics for the dashboard
    today = timezone.now().date()
    
    # Active orders (not completed or cancelled)
    active_orders = ServiceOrder.objects.exclude(status__in=['COMPLETED', 'CANCELLED'])
    
    # KPIs
    todays_bookings = Appointment.objects.filter(date_time__date=today).count()
    vehicles_received = active_orders.filter(status='CHECKED_IN').count()
    active_services = active_orders.count()
    pending_inspections = active_orders.filter(status='INSPECTION').count()
    pending_estimates = Estimate.objects.filter(status='DRAFT').count()
    awaiting_approval = Estimate.objects.filter(status='SENT').count()
    approved_repairs = active_orders.filter(status='REPAIRING').count()
    completed_today = ServiceOrder.objects.filter(status='COMPLETED', date_completed__date=today).count()
    
    # Stages for workflow pipeline
    stages = [
        {'id': 'booked', 'label': 'Booked', 'count': todays_bookings, 'color': 'border-blue-400'},
        {'id': 'received', 'label': 'Received', 'count': vehicles_received, 'color': 'border-indigo-400'},
        {'id': 'inspection', 'label': 'Inspection', 'count': pending_inspections, 'color': 'border-amber-400'},
        {'id': 'estimate', 'label': 'Estimate', 'count': pending_estimates, 'color': 'border-orange-400'},
        {'id': 'approval', 'label': 'Approval', 'count': awaiting_approval, 'color': 'border-purple-400'},
        {'id': 'repair', 'label': 'Repairing', 'count': approved_repairs, 'color': 'border-[#35D07F]'},
        {'id': 'qc', 'label': 'Quality Check', 'count': active_orders.filter(status='QUALITY_CHECK').count(), 'color': 'border-emerald-400'},
        {'id': 'completed', 'label': 'Completed', 'count': completed_today, 'color': 'border-slate-300'},
        {'id': 'delivered', 'label': 'Delivered', 'count': 0, 'color': 'border-slate-600'},
    ]
    
    return Response({
        'kpis': {
            'todays_bookings': todays_bookings,
            'vehicles_received': vehicles_received,
            'active_services': active_services,
            'pending_inspections': pending_inspections,
            'pending_estimates': pending_estimates,
            'awaiting_approval': awaiting_approval,
            'approved_repairs': approved_repairs,
            'completed_today': completed_today,
        },
        'workflow_stages': stages
    })

class AdvisorServiceOrderViewSet(viewsets.ModelViewSet):
    serializer_class = AdvisorServiceOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = ServiceOrder.objects.select_related('vehicle', 'vehicle__owner', 'service_estimate', 'branch').prefetch_related('inspections', 'timeline', 'work_performed', 'parts_used').order_by('-date_created')
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return qs
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN']:
            return qs.filter(branch=user.branch)
        if user.role == 'CUSTOMER':
            return qs.filter(vehicle__owner=user)
        return qs.none()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Ensure a valid vehicle is used for mock check-ins
        vehicle_id = data.get('vehicle_id')
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Exception:
            vehicle = Vehicle.objects.first()
            if not vehicle:
                return Response({'detail': 'No vehicles exist in the database to associate with.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Manually create the service order to bypass read-only vehicle serialization
        order = ServiceOrder.objects.create(
            vehicle=vehicle,
            order_number=data.get('order_number', f"RT-{timezone.now().timestamp()}"),
            title=data.get('title', 'General Service'),
            type=data.get('type', 'Maintenance'),
            status=data.get('status', 'CHECKED_IN'),
            technician=data.get('technician', ''),
            progress=0
        )
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def active(self, request):
        active = self.get_queryset().exclude(status__in=['COMPLETED', 'CANCELLED'])
        serializer = self.get_serializer(active, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        from .utils_pdf import generate_estimate_pdf
        from django.http import HttpResponse
        
        service_order = self.get_object()
        # In a real setup, we query the related estimate. The serializer field is `service_estimate`
        estimate = getattr(service_order, 'service_estimate', None) 
        
        pdf_bytes = generate_estimate_pdf(estimate, service_order)
        
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Estimate_{service_order.order_number}.pdf"'
        return response

class AdvisorAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AdvisorAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related('customer', 'vehicle', 'branch').order_by('date_time')
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return qs
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN']:
            return qs.filter(branch=user.branch)
        if user.role == 'CUSTOMER':
            return qs.filter(customer=user)
        return qs.none()

class EstimateViewSet(viewsets.ModelViewSet):
    serializer_class = EstimateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Estimate.objects.select_related('service_order', 'advisor')
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return qs
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR']:
            return qs.filter(service_order__branch=user.branch)
        if user.role == 'CUSTOMER':
            return qs.filter(service_order__vehicle__owner=user)
        return qs.none()
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        estimate = self.get_object()
        estimate.status = 'SENT'
        estimate.sent_date = timezone.now()
        estimate.save()
        return Response(self.get_serializer(estimate).data)

class CustomerCommunicationViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerCommunicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = CustomerCommunication.objects.all().order_by('-created_at')
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return qs
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR']:
            return qs.filter(service_order__branch=user.branch)
        if user.role == 'CUSTOMER':
            return qs.filter(customer=user)
        return qs.none()

class FollowUpTaskViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = FollowUpTask.objects.all().order_by('due_time')
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return qs
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR']:
            return qs.filter(service_order__branch=user.branch)
        return qs.none()

class VehicleDamageViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleDamageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = VehicleDamage.objects.all().order_by('-created_at')
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return qs
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN']:
            return qs.filter(vehicle__service_orders__branch=user.branch).distinct()
        if user.role == 'CUSTOMER':
            return qs.filter(vehicle__owner=user)
        return qs.none()

class TechnicianViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TechnicianUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.filter(role='TECHNICIAN')
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return qs
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR']:
            return qs.filter(branch=user.branch)
        return qs.none()

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        qs = Conversation.objects.select_related('customer', 'vehicle', 'service_order', 'advisor').prefetch_related('messages', 'messages__sender').order_by('-updated_at')
        if user.is_authenticated:
            if user.role == 'CUSTOMER':
                return qs.filter(customer=user)
            elif user.role in ['SERVICE_ADVISOR', 'MANAGER']:
                return qs.filter(advisor=user)
        return qs

    def create(self, request, *args, **kwargs):
        customer_id = request.data.get('customer')
        advisor = request.user if request.user.is_authenticated and request.user.role != 'CUSTOMER' else User.objects.filter(role='SERVICE_ADVISOR').first()
        
        # Check if a conversation already exists
        existing = Conversation.objects.filter(customer_id=customer_id).first()
        if existing:
            return Response(self.get_serializer(existing).data, status=status.HTTP_200_OK)
            
        # Create new
        convo = Conversation.objects.create(customer_id=customer_id, advisor=advisor)
        return Response(self.get_serializer(convo).data, status=status.HTTP_201_CREATED)

class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TechnicianUserSerializer # We can reuse this since it just serializes User fields
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.filter(role='CUSTOMER').order_by('first_name')
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return qs
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR']:
            return qs.filter(branch=user.branch)
        return qs.none()

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.select_related('conversation', 'sender').order_by('created_at')
        if user.is_authenticated:
            if user.role == 'CUSTOMER':
                qs = qs.filter(conversation__customer=user)
            elif user.role in ['SERVICE_ADVISOR', 'MANAGER']:
                qs = qs.filter(conversation__advisor=user)
        
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            qs = qs.filter(conversation_id=conversation_id)
        return qs

    def perform_create(self, serializer):
        # Allowany testing fallback if user is not authenticated
        sender = self.request.user if self.request.user.is_authenticated else User.objects.filter(role='CUSTOMER').first()
        message = serializer.save(sender=sender)
        message.conversation.updated_at = timezone.now()
        message.conversation.save()

        # Generate notifications
        if message.sender.role == 'CUSTOMER':
            advisor = message.conversation.advisor
            if not advisor:
                advisor = User.objects.filter(role='SERVICE_ADVISOR').first()
            if advisor:
                SystemNotification.objects.create(
                    user=advisor,
                    notification_type='MESSAGE',
                    title=f'New Message from {message.sender.first_name or message.sender.username}',
                    message=message.content[:100] + ('...' if len(message.content) > 100 else ''),
                    action_url=f'/advisor/messages?contact={message.conversation.id}'
                )
        else:
            customer = message.conversation.customer
            if customer:
                SystemNotification.objects.create(
                    user=customer,
                    notification_type='MESSAGE',
                    title='New Message from Service Advisor',
                    message=message.content[:100] + ('...' if len(message.content) > 100 else ''),
                    action_url=f'/customer/messages?contact={message.conversation.id}'
                )

        # Broadcast via WebSockets
        channel_layer = get_channel_layer()
        if channel_layer:
            # Broadcast to advisor
            async_to_sync(channel_layer.group_send)(
                "advisor_updates",
                {
                    "type": "chat_message",
                    "data": self.get_serializer(message).data
                }
            )
            # Broadcast to specific customer
            customer_id = message.conversation.customer.id
            async_to_sync(channel_layer.group_send)(
                f"customer_updates_{customer_id}",
                {
                    "type": "chat_message",
                    "data": self.get_serializer(message).data
                }
            )

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        conversation_id = request.data.get('conversation_id')
        if not conversation_id:
            return Response({"detail": "conversation_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        qs = Message.objects.filter(conversation_id=conversation_id, is_read=False)
        if user.is_authenticated:
            qs = qs.exclude(sender=user)
            
        updated = qs.update(is_read=True)
        return Response({"updated": updated}, status=status.HTTP_200_OK)

from .models import SystemNotification
from .serializers_advisor import SystemNotificationSerializer

class SystemNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = SystemNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allowany for testing, but typically filter by user
        if self.request.user.is_authenticated:
            return SystemNotification.objects.filter(user=self.request.user).order_by('-created_at')
        return SystemNotification.objects.all().order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        qs = self.get_queryset()
        qs.update(is_read=True)
        return Response({'status': 'ok'})

class AdvisorVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    from .serializers_advisor import AdvisorVehicleSerializer
    serializer_class = AdvisorVehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from .models import Vehicle
        user = self.request.user
        qs = Vehicle.objects.prefetch_related('health_categories', 'maintenance_items', 'warranties', 'documents')
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return qs
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN']:
            return qs.filter(service_orders__branch=user.branch).distinct()
        if user.role == 'CUSTOMER':
            return qs.filter(owner=user)
        return qs.none()
