import os
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Vehicle, ServiceOrder, VehicleDocument
from .serializers import VehicleSerializer, ServiceOrderSerializer, AdminVehicleSerializer, VehicleDocumentSerializer
from core.utils import get_scoped_queryset

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'message': 'API is running successfully'})

class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Vehicle.objects.filter(owner=self.request.user).prefetch_related(
                'health_categories', 'maintenance_items', 'warranties', 'documents'
            )
        return Vehicle.objects.none()

    @action(detail=True, methods=['get'])
    def service_history(self, request, pk=None):
        vehicle = self.get_object()
        
        # Optional filters
        service_type = request.query_params.get('type')
        search = request.query_params.get('search')
        
        queryset = ServiceOrder.objects.filter(vehicle=vehicle).select_related('vehicle', 'branch').prefetch_related(
            'timeline', 'work_performed', 'parts_used'
        ).order_by('-date_created')
        
        if service_type and service_type.lower() != 'all':
            queryset = queryset.filter(type__icontains=service_type)
            
        if search:
            queryset = queryset.filter(title__icontains=search) | queryset.filter(order_number__icontains=search)
            
        serializer = ServiceOrderSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_document(self, request, pk=None):
        vehicle = self.get_object()
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        from core.utils import validate_file_upload
        try:
            validate_file_upload(file)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        title = request.data.get('title', 'Document')
        subtitle = request.data.get('subtitle', '')
        
        doc = VehicleDocument.objects.create(
            vehicle=vehicle,
            title=title,
            subtitle=subtitle,
            file=file
        )
        serializer = VehicleDocumentSerializer(doc)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only vehicle viewset for admin / org-admin / manager dashboards.
    Returns ALL vehicles visible to the authenticated staff user.
    """
    serializer_class = AdminVehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Vehicle.objects.select_related('owner').prefetch_related('service_orders').order_by('-id')
        return get_scoped_queryset(qs, self.request.user, branch_lookup='service_orders__branch').distinct()



class ServiceOrderViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        import uuid
        from rest_framework.exceptions import PermissionDenied
        
        vehicle = serializer.validated_data.get('vehicle')
        if vehicle and vehicle.owner != self.request.user:
            raise PermissionDenied("You do not own this vehicle.")
            
        order_number = f"ORD-{str(uuid.uuid4())[:8].upper()}"
        
        branch = self.request.user.branch
        if not branch:
            raise PermissionDenied("You are not assigned to any branch.")
            
        serializer.save(order_number=order_number, branch=branch)

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return ServiceOrder.objects.filter(vehicle__owner=self.request.user).select_related(
                'vehicle', 'branch'
            ).prefetch_related(
                'timeline', 'work_performed', 'parts_used'
            )
        return ServiceOrder.objects.none()



from .models import Appointment
from .serializers import AppointmentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()
            
        qs = Appointment.objects.all()
        if user.role == 'CUSTOMER':
            return qs.filter(customer=user)
        elif user.role == 'SUPER_ADMIN':
            return qs
        elif user.role == 'ORG_ADMIN' and getattr(user, 'organization', None):
            return qs.filter(branch__organization=user.organization)
        elif user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN'] and getattr(user, 'branch', None):
            return qs.filter(branch=user.branch)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        vehicle = serializer.validated_data.get('vehicle')
        if vehicle and vehicle.owner != self.request.user:
            raise PermissionDenied("You do not own this vehicle.")
            
        # For customers, branch might be selected in form. Otherwise fallback to their profile branch.
        branch = serializer.validated_data.get('branch') or getattr(self.request.user, 'branch', None)
        if not branch:
             raise PermissionDenied("A branch must be specified for the appointment.")
             
        # Force customer to be the request user
        appointment = serializer.save(customer=self.request.user, branch=branch)
        
        # Notify branch staff
        from django.contrib.auth import get_user_model
        from .models import SystemNotification
        User = get_user_model()
        staff_members = User.objects.filter(branch=branch, role__in=['BRANCH_MANAGER', 'SERVICE_ADVISOR'])
        for staff in staff_members:
            SystemNotification.objects.create(
                user=staff,
                notification_type='SYSTEM',
                title='New Service Request',
                message=f'New booking received from {self.request.user.first_name} for {vehicle.make} {vehicle.model}.' if vehicle else f'New booking received from {self.request.user.first_name}.',
                action_url='/manager/appointments'
            )

# --- PREMIUM CUSTOMER DASHBOARD VIEWS ---
from .models import (
    CustomerProfile, SupportTicket, SupportMessage, Invoice,
    SubscriptionPlan, CustomerSubscription, NotificationPreference, PaymentMethod
)
from .serializers import (
    CustomerProfileSerializer, SupportTicketSerializer, SupportMessageSerializer, InvoiceSerializer,
    SubscriptionPlanSerializer, CustomerSubscriptionSerializer, NotificationPreferenceSerializer, PaymentMethodSerializer
)

class CustomerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return CustomerProfile.objects.filter(user=self.request.user).select_related('user')
        return CustomerProfile.objects.none()

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return SupportTicket.objects.filter(customer=self.request.user).select_related('customer')
        return SupportTicket.objects.none()

class SupportMessageViewSet(viewsets.ModelViewSet):
    serializer_class = SupportMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return SupportMessage.objects.filter(ticket__customer=self.request.user).select_related('ticket', 'sender')
        return SupportMessage.objects.none()

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Invoice.objects.filter(customer=self.request.user).select_related('branch', 'customer', 'vehicle', 'service_order')
        return Invoice.objects.none()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        invoice = self.get_object()
        from core.utils_pdf import generate_invoice_pdf
        from django.http import HttpResponse
        
        pdf_content = generate_invoice_pdf(invoice)
        
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{invoice.invoice_number}.pdf"'
        return response

    @action(detail=True, methods=['post'], url_path='create-razorpay-order')
    def create_razorpay_order(self, request, pk=None):
        import uuid
        from django.conf import settings
        invoice = self.get_object()
        
        if invoice.status == 'PAID':
            return Response({'error': 'Invoice has already been paid.'}, status=status.HTTP_400_BAD_REQUEST)

        amount_in_rupees = float(invoice.amount)
        amount_in_paise = int(amount_in_rupees * 100)

        key_id = getattr(settings, 'RAZORPAY_KEY_ID', None) or os.environ.get('RAZORPAY_KEY_ID')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None) or os.environ.get('RAZORPAY_KEY_SECRET')

        if not key_id or not key_secret or key_id.startswith('dummy') or key_secret == 'test_secret':
            return Response({'error': 'Payment gateway is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            order_data = {
                'amount': amount_in_paise,
                'currency': 'INR',
                'receipt': f"inv_{str(invoice.id)[:8]}",
                'notes': {
                    'invoice_id': str(invoice.id),
                    'invoice_number': invoice.invoice_number,
                }
            }
            order = client.order.create(data=order_data)
            order_id = order.get('id')
            is_live = True
        except Exception as e:
            return Response({'error': f'Failed to create payment order: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        customer_name = getattr(invoice.customer, 'name', '') or f"{getattr(invoice.customer, 'first_name', '')} {getattr(invoice.customer, 'last_name', '')}".strip() or invoice.customer.username or invoice.customer.email.split('@')[0]
        customer_email = invoice.customer.email or ''
        customer_phone = getattr(invoice.customer, 'phone_number', '') or getattr(invoice.customer, 'phone', '') or ''

        return Response({
            'order_id': order_id,
            'amount': amount_in_paise,
            'currency': 'INR',
            'key_id': key_id,
            'is_live': is_live,
            'invoice_id': str(invoice.id),
            'invoice_number': invoice.invoice_number,
            'service_name': invoice.service_order.title if (invoice.service_order and invoice.service_order.title) else "Auto Garage Service",
            'name': 'RepairTrace Garage',
            'description': f"Payment for Invoice {invoice.invoice_number}",
            'prefill': {
                'name': customer_name,
                'email': customer_email,
                'contact': customer_phone,
            }
        })

    @action(detail=True, methods=['post'], url_path='verify-payment')
    def verify_payment(self, request, pk=None):
        import uuid
        from django.conf import settings
        from django.utils import timezone
        from .models import SystemNotification, ServiceTimelineEvent

        invoice = self.get_object()

        payment_id = request.data.get('razorpay_payment_id') or request.data.get('payment_id')
        order_id = request.data.get('razorpay_order_id') or request.data.get('order_id')
        signature = request.data.get('razorpay_signature') or request.data.get('signature')

        key_id = getattr(settings, 'RAZORPAY_KEY_ID', None) or os.environ.get('RAZORPAY_KEY_ID', '')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None) or os.environ.get('RAZORPAY_KEY_SECRET', '')

        if invoice.status == 'PAID':
            return Response({'status': 'success', 'message': 'Invoice is already paid.'})

        if not payment_id or not order_id or not signature:
            return Response({'error': 'Missing payment verification parameters.'}, status=status.HTTP_400_BAD_REQUEST)

        if not key_id or not key_secret:
            return Response({'error': 'Payment gateway is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })
        except Exception as e:
            return Response({'error': f'Signature verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Update invoice
        invoice.status = 'PAID'
        invoice.paid = invoice.amount
        invoice.save(update_fields=['status', 'paid'])

        # Send notification to customer
        try:
            SystemNotification.objects.create(
                user=invoice.customer,
                notification_type='ALERT',
                title='Invoice Paid Successfully',
                message=f'Invoice {invoice.invoice_number} of ₹{invoice.amount} has been paid via Razorpay.',
                action_url='/customer/invoices'
            )
        except Exception as e:
            print(f"[Razorpay] Notification error: {e}")

        # Update service order timeline if linked
        if invoice.service_order:
            try:
                ServiceTimelineEvent.objects.create(
                    service_order=invoice.service_order,
                    title=f"Payment Received via Razorpay (Ref: {payment_id})",
                    time=timezone.now(),
                    completed=True
                )
                # Auto-update ServiceOrder status when paid so manager and tracker see it
                if invoice.service_order.status in ['AWAITING_APPROVAL', 'PENDING', 'CONFIRMED']:
                    invoice.service_order.status = 'IN_WORKSHOP'
                    invoice.service_order.save(update_fields=['status'])
            except Exception as e:
                print(f"[Razorpay] Timeline event error: {e}")

        return Response({
            'status': 'success',
            'message': 'Payment successfully recorded and invoice marked as PAID',
            'payment_id': payment_id,
            'invoice': InvoiceSerializer(invoice).data
        })

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class CustomerSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return CustomerSubscription.objects.filter(customer=self.request.user).select_related('customer', 'plan')
        return CustomerSubscription.objects.none()

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return NotificationPreference.objects.filter(user=self.request.user).select_related('user')
        return NotificationPreference.objects.none()

class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return PaymentMethod.objects.filter(user=self.request.user)
        return PaymentMethod.objects.none()


from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework import serializers

class UserCustomerSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    vehicles = serializers.SerializerMethodField()
    ltv = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    lastVisit = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    phone = serializers.CharField(source='phone_number')

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'vehicles', 'ltv', 'status', 'lastVisit', 'avatar']

    def get_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip() or obj.username

    def get_vehicles(self, obj):
        return obj.vehicles.count()

    def get_ltv(self, obj):
        return 0 # Or calculate from invoices

    def get_status(self, obj):
        return 'Active'

    def get_lastVisit(self, obj):
        return obj.date_joined.strftime('%Y-%m-%d')

    def get_avatar(self, obj):
        return f'https://i.pravatar.cc/150?u={obj.username}'

class UserCustomerViewSet(viewsets.ModelViewSet):
    serializer_class = UserCustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        qs = User.objects.filter(role='CUSTOMER').order_by('-date_joined')
        return get_scoped_queryset(qs, self.request.user, branch_lookup='branch')

import secrets
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import VehicleQRCode, VehicleDocument, ServiceTimelineEvent

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_vehicle_qr(request, pk):
    qs = Vehicle.objects.all()
    qs = get_scoped_queryset(qs, request.user, branch_lookup='service_orders__branch', customer_lookup='owner').distinct()
    vehicle = get_object_or_404(qs, pk=pk)
    qr = VehicleQRCode.objects.filter(vehicle=vehicle, is_active=True).first()
    if not qr:
        token = secrets.token_urlsafe(32)
        qr = VehicleQRCode.objects.create(vehicle=vehicle, token=token)
        
    base_url = os.getenv('VEHICLE_HISTORY_BASE_URL', 'https://repairtrace.app')
    qr_url = f"{base_url}/v/{qr.token}"
    return Response({
        'vehicle_id': vehicle.id,
        'token': qr.token,
        'qr_url': qr_url
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def regenerate_vehicle_qr(request, pk):
    qs = Vehicle.objects.all()
    qs = get_scoped_queryset(qs, request.user, branch_lookup='service_orders__branch', customer_lookup='owner').distinct()
    vehicle = get_object_or_404(qs, pk=pk)
    # Revoke old QRs
    VehicleQRCode.objects.filter(vehicle=vehicle, is_active=True).update(is_active=False, revoked_at=timezone.now())
    
    # Create new
    token = secrets.token_urlsafe(32)
    qr = VehicleQRCode.objects.create(vehicle=vehicle, token=token, created_by=request.user if request.user.is_authenticated else None)
    
    base_url = os.getenv('VEHICLE_HISTORY_BASE_URL', 'https://repairtrace.app')
    qr_url = f"{base_url}/v/{qr.token}"
    return Response({
        'vehicle_id': vehicle.id,
        'token': qr.token,
        'qr_url': qr_url
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def revoke_vehicle_qr(request, pk):
    qs = Vehicle.objects.all()
    qs = get_scoped_queryset(qs, request.user, branch_lookup='service_orders__branch', customer_lookup='owner').distinct()
    vehicle = get_object_or_404(qs, pk=pk)
    VehicleQRCode.objects.filter(vehicle=vehicle, is_active=True).update(is_active=False, revoked_at=timezone.now())
    return Response({'status': 'revoked'})

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_vehicle_history(request, token):
    qr = VehicleQRCode.objects.filter(token=token).first()
    if not qr or not qr.is_active:
        return Response({'error': 'Invalid or expired vehicle history link.'}, status=status.HTTP_404_NOT_FOUND)
        
    # Log scan
    qr.scan_count += 1
    qr.last_scanned_at = timezone.now()
    qr.save()
    
    vehicle = qr.vehicle
    
    # Fetch safe public history (no private customer info)
    history_events = ServiceTimelineEvent.objects.filter(service_order__vehicle=vehicle, completed=True).select_related('service_order').order_by('-time')
    timeline = []
    for event in history_events:
        timeline.append({
            'date': event.time.strftime('%Y-%m-%d'),
            'title': event.title,
            'description': event.service_order.title
        })
        
    return Response({
        'vehicle': {
            'make': vehicle.make,
            'model': vehicle.model,
            'year': vehicle.year,
            'vin': f"*********{vehicle.vin[-4:]}" if vehicle.vin and len(vehicle.vin) > 4 else vehicle.vin,
            'color': vehicle.color,
            'image_url': vehicle.image_url
        },
        'timeline': timeline
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def customer_dashboard(request):
    user = request.user
    
    customer_data = {
        'id': user.id,
        'name': f"{user.first_name} {user.last_name}".strip() or user.username,
        'email': user.email,
    }

    vehicle = Vehicle.objects.filter(owner=user).first()
    vehicle_data = VehicleSerializer(vehicle).data if vehicle else None

    # Common active statuses based on typical service order statuses
    active_service = ServiceOrder.objects.filter(
        vehicle__owner=user
    ).exclude(status__in=['COMPLETED', 'CANCELLED']).order_by('-date_created').first()
    
    active_service_data = ServiceOrderSerializer(active_service).data if active_service else None

    return Response({
        'customer': customer_data,
        'vehicle': vehicle_data,
        'activeService': active_service_data
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def technician_dashboard_stats(request):
    from .models import ServiceOrder, Vehicle
    # In a real app, filter by technician assigned. For now, filter by all.
    orders = ServiceOrder.objects.exclude(status__in=['COMPLETED', 'CLOSED', 'CANCELLED'])
    
    total_assigned = orders.count()
    pending_inspections = orders.filter(status__in=['CHECKED_IN', 'DIAGNOSIS']).count()
    in_progress = orders.filter(status='IN_WORKSHOP').count()
    completed_today = ServiceOrder.objects.filter(status='COMPLETED', date_completed__date=timezone.now().date()).count()
    
    return Response({
        'total_assigned': total_assigned,
        'pending_inspections': pending_inspections,
        'in_progress': in_progress,
        'completed_today': completed_today,
        'performance_score': 98,
        'efficiency': 94
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def technician_work_orders(request):
    from .models import ServiceOrder
    orders = ServiceOrder.objects.exclude(status__in=['COMPLETED', 'CLOSED', 'CANCELLED']).select_related('vehicle', 'vehicle__owner')
    data = []
    for order in orders:
        data.append({
            'id': str(order.id),
            'order_number': order.order_number,
            'title': order.title,
            'status': order.status,
            'progress': order.progress,
            'advisor': order.advisor,
            'vehicle': {
                'make': order.vehicle.make,
                'model': order.vehicle.model,
                'registration_number': order.vehicle.registration_number
            }
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_dashboard_kpis(request):
    from django.db.models import Sum
    from django.utils import timezone
    from .models import Vehicle, ServiceOrder, Invoice, Appointment
    
    vehicles_qs = get_scoped_queryset(Vehicle.objects.all(), request.user, branch_lookup='service_orders__branch').distinct()
    services_qs = get_scoped_queryset(ServiceOrder.objects.all(), request.user)
    invoices_qs = get_scoped_queryset(Invoice.objects.all(), request.user)
    appointments_qs = get_scoped_queryset(Appointment.objects.all(), request.user)
        
    total_vehicles = vehicles_qs.count()
    active_services = services_qs.exclude(status__in=['COMPLETED', 'CLOSED', 'CANCELLED']).count()
    pending_approvals = services_qs.filter(status='AWAITING_APPROVAL').count()
    today = timezone.now().date()
    todays_bookings = appointments_qs.filter(date_time__date=today).count()
    
    active_inspections = services_qs.filter(status='DIAGNOSIS').count()
    open_issues = services_qs.filter(status='IN_WORKSHOP').count() # proxy for now
    
    pending_invoices_val = invoices_qs.exclude(status='PAID').aggregate(total=Sum('amount'))['total'] or 0
    monthly_revenue = invoices_qs.filter(status='PAID', created_at__month=today.month, created_at__year=today.year).aggregate(total=Sum('amount'))['total'] or 0
    
    # Build Kanban pipeline
    stages = [
        {'id': 'intake', 'label': 'Intake & Diagnosis', 'statuses': ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'DIAGNOSIS']},
        {'id': 'approval', 'label': 'Awaiting Approval', 'statuses': ['AWAITING_APPROVAL']},
        {'id': 'progress', 'label': 'In Progress', 'statuses': ['AWAITING_PARTS', 'IN_WORKSHOP']},
        {'id': 'quality', 'label': 'QC & Ready', 'statuses': ['QUALITY_CHECK', 'READY_FOR_PICKUP']},
    ]
    
    pipeline = []
    for stage in stages:
        jobs = services_qs.filter(status__in=stage['statuses']).select_related('vehicle', 'vehicle__owner')
        job_list = []
        for job in jobs:
            job_list.append({
                'id': job.order_number,
                'vehicle': str(job.vehicle),
                'customer': getattr(job.vehicle.owner, 'first_name', '') + ' ' + getattr(job.vehicle.owner, 'last_name', '') if job.vehicle and job.vehicle.owner else 'Unknown',
                'priority': 'High' if job.status in ['AWAITING_PARTS', 'QUALITY_CHECK'] else 'Normal',
                'progress': job.progress
            })
        pipeline.append({
            'stage': stage['label'],
            'count': len(job_list),
            'jobs': job_list
        })
        
    return Response({
        'kpi_primary': {
            'total_vehicles': total_vehicles,
            'active_services': active_services,
            'pending_approvals': pending_approvals,
            'todays_bookings': todays_bookings
        },
        'kpi_secondary': {
            'active_inspections': active_inspections,
            'open_issues': open_issues,
            'pending_invoices': float(pending_invoices_val),
            'monthly_revenue': float(monthly_revenue)
        },
        'repair_pipeline': pipeline
    })

import os
import mimetypes
from django.conf import settings
from django.http import HttpResponse, Http404, FileResponse
from django.utils._os import safe_join
from django.core.exceptions import SuspiciousFileOperation
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from core.models import VehicleDocument, IssueEvidence, GeneratedDocument, TechnicianPhoto, Message
from core.utils import get_scoped_queryset

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def secure_media_serve(request, path):
    try:
        file_path = safe_join(settings.MEDIA_ROOT, path)
    except SuspiciousFileOperation:
        raise Http404("File not found")
        
    if not os.path.exists(file_path):
        raise Http404("File not found")
        
    user = request.user
    if user.role != 'SUPER_ADMIN':
        authorized = False
        
        if VehicleDocument.objects.filter(file=path).exists():
            qs = get_scoped_queryset(VehicleDocument.objects.all(), user, branch_lookup='vehicle__service_orders__branch', customer_lookup='vehicle__owner')
            if qs.filter(file=path).exists():
                authorized = True
                
        elif IssueEvidence.objects.filter(file=path).exists():
            qs = get_scoped_queryset(IssueEvidence.objects.all(), user, branch_lookup='issue__service_order__branch', customer_lookup='issue__service_order__vehicle__owner')
            if qs.filter(file=path).exists():
                authorized = True
                
        elif GeneratedDocument.objects.filter(file=path).exists():
            qs = get_scoped_queryset(GeneratedDocument.objects.all(), user, branch_lookup='estimate__service_order__branch', customer_lookup='estimate__service_order__vehicle__owner')
            if qs.filter(file=path).exists():
                authorized = True
                
        elif TechnicianPhoto.objects.filter(image=path).exists():
            qs = get_scoped_queryset(TechnicianPhoto.objects.all(), user, branch_lookup='vehicle__service_orders__branch', customer_lookup='vehicle__owner')
            if qs.filter(image=path).exists():
                authorized = True

        elif Message.objects.filter(attachment=path).exists():
            qs = get_scoped_queryset(Message.objects.all(), user, branch_lookup='conversation__service_order__branch', customer_lookup='conversation__customer')
            if qs.filter(attachment=path).exists():
                authorized = True
                
        if not authorized:
            raise Http404("File not found")

    content_type, _ = mimetypes.guess_type(file_path)
    return FileResponse(open(file_path, 'rb'), content_type=content_type or 'application/octet-stream')
