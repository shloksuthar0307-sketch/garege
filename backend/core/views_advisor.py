from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
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
from .serializers import InvoiceSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from accounts.permissions import IsServiceAdvisor
from core.utils import get_scoped_queryset, safe_group_send
User = get_user_model()

@api_view(['GET'])
@permission_classes([IsServiceAdvisor])
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
    pending_inspections = active_orders.filter(status='DIAGNOSIS').count()          # fixed: DIAGNOSIS not INSPECTION
    pending_estimates = Estimate.objects.filter(status='DRAFT').count()
    awaiting_approval = active_orders.filter(status='AWAITING_APPROVAL').count()   # fixed: use ServiceOrder status
    approved_repairs = active_orders.filter(status='IN_WORKSHOP').count()          # fixed: IN_WORKSHOP not REPAIRING
    completed_today = ServiceOrder.objects.filter(status='COMPLETED', date_completed__date=today).count()
    
    # Stages for workflow pipeline
    stages = [
        {'id': 'booked',     'label': 'Booked',       'count': todays_bookings,                                                    'color': 'border-blue-400'},
        {'id': 'received',   'label': 'Received',     'count': vehicles_received,                                                  'color': 'border-indigo-400'},
        {'id': 'inspection', 'label': 'Inspection',   'count': pending_inspections,                                                'color': 'border-amber-400'},
        {'id': 'estimate',   'label': 'Estimate',     'count': pending_estimates,                                                  'color': 'border-orange-400'},
        {'id': 'approval',   'label': 'Approval',     'count': awaiting_approval,                                                  'color': 'border-purple-400'},
        {'id': 'repair',     'label': 'Repairing',    'count': approved_repairs,                                                   'color': 'border-[#35D07F]'},
        {'id': 'qc',         'label': 'Quality Check','count': active_orders.filter(status='QUALITY_CHECK').count(),               'color': 'border-emerald-400'},
        {'id': 'completed',  'label': 'Completed',    'count': completed_today,                                                    'color': 'border-slate-300'},
        {'id': 'delivered',  'label': 'Delivered',    'count': ServiceOrder.objects.filter(status='CLOSED', date_completed__date=today).count(), 'color': 'border-slate-600'},
    ]
    
    return Response({
        'kpis': {
            'todays_bookings':    todays_bookings,
            'vehicles_received':  vehicles_received,
            'active_services':    active_services,
            'pending_inspections':pending_inspections,
            'pending_estimates':  pending_estimates,
            'awaiting_approval':  awaiting_approval,
            'approved_repairs':   approved_repairs,
            'completed_today':    completed_today,
        },
        'workflow_stages': stages
    })

class AdvisorServiceOrderViewSet(viewsets.ModelViewSet):
    serializer_class = AdvisorServiceOrderSerializer
    permission_classes = [IsServiceAdvisor]

    def get_queryset(self):
        qs = ServiceOrder.objects.select_related('vehicle', 'vehicle__owner', 'service_estimate', 'branch').prefetch_related('inspections', 'timeline', 'work_performed', 'parts_used').order_by('-date_created')
        return get_scoped_queryset(qs, self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        import uuid
        data = request.data.copy()
        
        vehicle_id = data.get('vehicle_id')
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Exception:
            return Response({'detail': 'Invalid or missing vehicle ID.'}, status=status.HTTP_400_BAD_REQUEST)
        
        appointment_id = data.get('appointment_id')
        if appointment_id:
            try:
                appointment = Appointment.objects.select_for_update().get(id=appointment_id)
                if appointment.status == 'CHECKED_IN':
                    return Response({'detail': 'Appointment already checked in.'}, status=status.HTTP_400_BAD_REQUEST)
                appointment.status = 'CHECKED_IN'
                appointment.save(update_fields=['status'])
            except Exception:
                pass

        branch = getattr(request.user, 'branch', None)
        
        order = ServiceOrder.objects.create(
            vehicle=vehicle,
            order_number=data.get('order_number') or f"ORD-{str(uuid.uuid4())[:8].upper()}",
            title=data.get('title', 'General Service'),
            type=data.get('type', 'Maintenance'),
            status=data.get('status', 'CHECKED_IN'),
            technician=data.get('technician', ''),
            branch=branch,
            progress=0
        )
        
        # Timeline event
        from .models import ServiceTimelineEvent, SystemNotification
        ServiceTimelineEvent.objects.create(
            service_order=order,
            title='Vehicle Checked In',
            time=timezone.now(),
            completed=True
        )
        
        # Notify customer
        if order.vehicle and order.vehicle.owner:
            SystemNotification.objects.create(
                user=order.vehicle.owner,
                notification_type='INFO',
                title='Vehicle Checked In',
                message=f'Your vehicle {order.vehicle.make} {order.vehicle.model} has been checked in for service.',
                action_url='/customer/dashboard'
            )
            
        # Notify technician if assigned
        if order.technician:
            technician_user = User.objects.filter(username=order.technician).first() or User.objects.filter(first_name=order.technician).first()
            if technician_user:
                SystemNotification.objects.create(
                    user=technician_user,
                    notification_type='SYSTEM',
                    title='New Job Assigned',
                    message=f'You have been assigned to order {order.order_number}.',
                    action_url='/technician/dashboard'
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
    permission_classes = [IsServiceAdvisor]

    # Roles allowed to CREATE bookings
    BOOKING_CREATE_ROLES = ('CUSTOMER', 'BRANCH_MANAGER', 'SERVICE_ADVISOR', 'SUPER_ADMIN', 'ORG_ADMIN')

    def get_queryset(self):
        qs = Appointment.objects.select_related('customer', 'vehicle', 'branch').order_by('date_time')
        return get_scoped_queryset(qs, self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        role = getattr(user, 'role', '')
        if not (user.is_superuser or role in self.BOOKING_CREATE_ROLES):
            return Response(
                {'detail': 'Only customers and branch managers can create bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class EstimateViewSet(viewsets.ModelViewSet):
    serializer_class = EstimateSerializer
    permission_classes = [permissions.IsAuthenticated] # Kept as IsAuthenticated so customers can view it if this is the only viewset

    def get_queryset(self):
        qs = Estimate.objects.select_related('service_order', 'advisor')
        user = self.request.user
        
        # Scoped queryset logic manually for estimate since it's via service_order
        if user.role == 'SUPER_ADMIN':
            return qs
        elif user.role == 'ORG_ADMIN' and user.organization:
            return qs.filter(service_order__branch__organization=user.organization)
        elif user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR'] and user.branch:
            return qs.filter(service_order__branch=user.branch)
        elif user.role == 'CUSTOMER':
            return qs.filter(service_order__vehicle__owner=user)
        return qs.none()
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        if request.user.role not in ['SUPER_ADMIN', 'ORG_ADMIN', 'BRANCH_MANAGER', 'SERVICE_ADVISOR']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only authorized staff can send estimates.")
        
        estimate = self.get_object()
        estimate.status = 'SENT'
        estimate.sent_date = timezone.now()
        estimate.save()
        return Response(self.get_serializer(estimate).data)

    @transaction.atomic
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'CUSTOMER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the customer can approve the estimate.")
            
        estimate = Estimate.objects.select_for_update().get(pk=self.get_object().pk)
        if estimate.status == 'APPROVED':
            return Response({'detail': 'Estimate already approved.'}, status=status.HTTP_400_BAD_REQUEST)
        if estimate.status not in ['SENT', 'VIEWED']:
            return Response({'detail': 'Only sent estimates can be approved.'}, status=status.HTTP_400_BAD_REQUEST)
            
        estimate.status = 'APPROVED'
        estimate.approved_date = timezone.now()
        estimate.approved_by = request.user
        estimate.save()
        
        # Update ServiceOrder status
        service_order = estimate.service_order
        if service_order and service_order.status == 'AWAITING_APPROVAL':
            service_order.status = 'IN_WORKSHOP'
            service_order.save(update_fields=['status'])
            
        # Record timeline event
        from .models import ServiceTimelineEvent
        ServiceTimelineEvent.objects.create(
            service_order=service_order,
            title=f"Estimate Approved by {request.user.get_full_name() or request.user.username}",
            time=timezone.now()
        )
            
        return Response(self.get_serializer(estimate).data)

    @transaction.atomic
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        if request.user.role != 'CUSTOMER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the customer can decline the estimate.")
            
        estimate = Estimate.objects.select_for_update().get(pk=self.get_object().pk)
        if estimate.status not in ['SENT', 'VIEWED']:
            return Response({'detail': 'Only sent estimates can be declined.'}, status=status.HTTP_400_BAD_REQUEST)
            
        estimate.status = 'DECLINED'
        estimate.save()
        
        # Record timeline event
        from .models import ServiceTimelineEvent
        ServiceTimelineEvent.objects.create(
            service_order=estimate.service_order,
            title=f"Estimate Declined by {request.user.get_full_name() or request.user.username}",
            time=timezone.now()
        )
        return Response(self.get_serializer(estimate).data)

class CustomerCommunicationViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerCommunicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = CustomerCommunication.objects.all().order_by('-created_at')
        if user.role == 'SUPER_ADMIN':
            return qs
        elif user.role == 'ORG_ADMIN' and user.organization:
            return qs.filter(service_order__branch__organization=user.organization)
        elif user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR'] and user.branch:
            return qs.filter(service_order__branch=user.branch)
        elif user.role == 'CUSTOMER':
            return qs.filter(customer=user)
        return qs.none()

class FollowUpTaskViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpTaskSerializer
    permission_classes = [IsServiceAdvisor]

    def get_queryset(self):
        qs = FollowUpTask.objects.all().order_by('due_time')
        return get_scoped_queryset(qs, self.request.user, branch_lookup='service_order__branch')

class VehicleDamageViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleDamageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = VehicleDamage.objects.all().order_by('-created_at')
        if user.role == 'SUPER_ADMIN':
            return qs
        elif user.role == 'ORG_ADMIN' and user.organization:
            return qs.filter(vehicle__service_orders__branch__organization=user.organization).distinct()
        elif user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN'] and user.branch:
            return qs.filter(vehicle__service_orders__branch=user.branch).distinct()
        elif user.role == 'CUSTOMER':
            return qs.filter(vehicle__owner=user)
        return qs.none()

class TechnicianViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TechnicianUserSerializer
    permission_classes = [IsServiceAdvisor]

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.filter(role='TECHNICIAN')
        if user.role == 'SUPER_ADMIN':
            return qs
        elif user.role == 'ORG_ADMIN' and user.organization:
            return qs.filter(organization=user.organization)
        elif user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR'] and user.branch:
            return qs.filter(branch=user.branch)
        return qs.none()

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        qs = Conversation.objects.select_related('customer', 'vehicle', 'service_order', 'advisor').prefetch_related('messages', 'messages__sender').order_by('-updated_at')
        if not user.is_authenticated:
            return qs.none()
            
        if user.role == 'CUSTOMER':
            return qs.filter(customer=user)
        elif user.role == 'SUPER_ADMIN':
            return qs
        elif user.role == 'ORG_ADMIN' and user.organization:
            from django.db.models import Q
            return qs.filter(Q(advisor__organization=user.organization) | Q(service_order__branch__organization=user.organization)).distinct()
        elif user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR'] and user.branch:
            from django.db.models import Q
            return qs.filter(Q(advisor__branch=user.branch) | Q(service_order__branch=user.branch)).distinct()
        elif user.role == 'TECHNICIAN':
            from django.db.models import Q
            return qs.filter(Q(service_order__technician=user.username) | Q(service_order__technician=user.first_name)).distinct()
        return qs.none()

    def create(self, request, *args, **kwargs):
        customer_id = request.data.get('customer')
        if not customer_id:
             return Response({'detail': 'Customer ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        customer = get_object_or_404(User, id=customer_id, role='CUSTOMER')
        user = request.user
        
        if user.role == 'CUSTOMER' and str(user.id) != str(customer_id):
            return Response({'detail': 'Not allowed to create conversation for another customer.'}, status=status.HTTP_403_FORBIDDEN)
            
        # Optional: check if customer belongs to advisor's branch (omitted for brevity, but should be enforced)
        
        advisor = user if user.role != 'CUSTOMER' else User.objects.filter(role='SERVICE_ADVISOR').first()
        if not advisor:
            return Response({'detail': 'No advisor available.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if a conversation already exists
        existing = Conversation.objects.filter(customer_id=customer_id).first()
        if existing:
            return Response(self.get_serializer(existing).data, status=status.HTTP_200_OK)
            
        # Create new
        convo = Conversation.objects.create(customer_id=customer_id, advisor=advisor)
        return Response(self.get_serializer(convo).data, status=status.HTTP_201_CREATED)

class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TechnicianUserSerializer # We can reuse this since it just serializes User fields
    permission_classes = [IsServiceAdvisor]

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.filter(role='CUSTOMER').order_by('first_name')
        if user.role == 'SUPER_ADMIN':
            return qs
        elif user.role == 'ORG_ADMIN' and user.organization:
            from django.db.models import Q
            return qs.filter(Q(branch__organization=user.organization) | Q(vehicle__service_orders__branch__organization=user.organization)).distinct()
        elif user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR'] and user.branch:
            from django.db.models import Q
            return qs.filter(Q(branch=user.branch) | Q(vehicle__service_orders__branch=user.branch)).distinct()
        return qs.none()

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.select_related('conversation', 'sender').order_by('created_at')
        if not user.is_authenticated:
            return qs.none()
            
        if user.role == 'CUSTOMER':
            qs = qs.filter(conversation__customer=user)
        elif user.role == 'SUPER_ADMIN':
            pass
        elif user.role == 'ORG_ADMIN' and user.organization:
            from django.db.models import Q
            qs = qs.filter(Q(conversation__advisor__organization=user.organization) | Q(conversation__service_order__branch__organization=user.organization)).distinct()
        elif user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR'] and user.branch:
            from django.db.models import Q
            qs = qs.filter(Q(conversation__advisor__branch=user.branch) | Q(conversation__service_order__branch=user.branch)).distinct()
        elif user.role == 'TECHNICIAN':
            from django.db.models import Q
            qs = qs.filter(Q(conversation__service_order__technician=user.username) | Q(conversation__service_order__technician=user.first_name)).distinct()
        else:
            return qs.none()
        
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            qs = qs.filter(conversation_id=conversation_id)
        return qs

    def perform_create(self, serializer):
        sender = self.request.user
        conversation = serializer.validated_data['conversation']
        
        # Enforce that sender has access to the conversation
        if not sender.is_authenticated:
            raise permissions.exceptions.PermissionDenied("Authentication required.")
        if sender.role == 'CUSTOMER' and conversation.customer != sender:
            raise permissions.exceptions.PermissionDenied("You are not part of this conversation.")
        elif sender.role == 'ORG_ADMIN' and getattr(sender, 'organization', None):
            if getattr(getattr(conversation.advisor, 'branch', None), 'organization', None) != sender.organization and getattr(getattr(conversation.service_order, 'branch', None), 'organization', None) != sender.organization:
                raise permissions.exceptions.PermissionDenied("You do not have access to this conversation.")
        elif sender.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR'] and getattr(sender, 'branch', None):
            if getattr(conversation.advisor, 'branch', None) != sender.branch and getattr(conversation.service_order, 'branch', None) != sender.branch:
                raise permissions.exceptions.PermissionDenied("You do not have access to this conversation.")
        elif sender.role == 'TECHNICIAN':
            if getattr(conversation.service_order, 'technician', None) not in [sender.username, sender.first_name]:
                raise permissions.exceptions.PermissionDenied("You are not assigned to this service order.")
                
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
            if message.conversation.advisor:
                safe_group_send(
                    f"advisor_updates_{message.conversation.advisor.id}",
                    {
                        "type": "chat_message",
                        "data": self.get_serializer(message).data
                    }
                )
            # Broadcast to specific customer
            customer_id = message.conversation.customer.id
            safe_group_send(
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
    permission_classes = [IsServiceAdvisor]

    def get_queryset(self):
        from .models import Vehicle
        qs = Vehicle.objects.prefetch_related('health_categories', 'maintenance_items', 'warranties', 'documents')
        return get_scoped_queryset(qs, self.request.user, branch_lookup='service_orders__branch').distinct()

class AdvisorInvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from .models import Invoice
        qs = Invoice.objects.select_related('customer', 'vehicle', 'service_order')
        return get_scoped_queryset(qs, self.request.user, branch_lookup='branch')

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        invoice = self.get_object()
        from decimal import Decimal
        amount = Decimal(str(request.data.get('amount', 0)))
        method = request.data.get('method', 'CARD')
        
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)
            
        invoice.paid += amount
        if invoice.paid >= invoice.amount:
            invoice.status = 'PAID'
            invoice.paid = invoice.amount
            if invoice.service_order:
                invoice.service_order.status = 'CLOSED'
                invoice.service_order.save()
        else:
            invoice.status = 'PARTIAL'
            
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)
