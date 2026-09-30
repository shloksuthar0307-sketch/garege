import os
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Vehicle, ServiceOrder
from .serializers import VehicleSerializer, ServiceOrderSerializer

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'message': 'API is running successfully'})

class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

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

class ServiceOrderViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return ServiceOrder.objects.filter(vehicle__owner=self.request.user).select_related(
                'vehicle', 'branch'
            ).prefetch_related(
                'timeline', 'work_performed', 'parts_used'
            )
        return ServiceOrder.objects.none()

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

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Invoice.objects.filter(customer=self.request.user).select_related('branch', 'customer', 'vehicle', 'service_order')
        return Invoice.objects.none()

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

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
        user = self.request.user
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return User.objects.filter(role='CUSTOMER').order_by('-date_joined')
        if user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN']:
            return User.objects.filter(role='CUSTOMER', branch=user.branch).order_by('-date_joined')
        if user.role == 'CUSTOMER':
            return User.objects.filter(id=user.id)
        return User.objects.none()

import secrets
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import VehicleQRCode, VehicleDocument, ServiceTimelineEvent

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_vehicle_qr(request, pk):
    qs = Vehicle.objects.all()
    if request.user.role == 'CUSTOMER':
        qs = qs.filter(owner=request.user)
    elif request.user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN']:
        qs = qs.filter(service_orders__branch=request.user.branch).distinct()
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
    if request.user.role == 'CUSTOMER':
        qs = qs.filter(owner=request.user)
    elif request.user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN']:
        qs = qs.filter(service_orders__branch=request.user.branch).distinct()
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
    if request.user.role == 'CUSTOMER':
        qs = qs.filter(owner=request.user)
    elif request.user.role in ['BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN']:
        qs = qs.filter(service_orders__branch=request.user.branch).distinct()
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

