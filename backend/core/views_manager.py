from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, F
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .models import (
    Vehicle, ServiceOrder, Appointment, InventoryPart, 
    PurchaseRequest, Invoice, CustomerIssue
)
from organizations.models import Branch

class IsBranchManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'BRANCH_MANAGER'

def get_manager_branch(user):
    return user.branch

@api_view(['GET'])
@permission_classes([IsBranchManager])
def manager_dashboard_kpis(request):
    branch = get_manager_branch(request.user)
    if not branch:
        return Response({'detail': 'No branch assigned to this manager.'}, status=status.HTTP_400_BAD_REQUEST)
    
    today = timezone.now().date()
    
    vehicles_in_workshop = ServiceOrder.objects.filter(
        branch=branch, 
        status__in=['IN_PROGRESS', 'PENDING']
    ).count()
    
    appointments_today = Appointment.objects.filter(
        branch=branch,
        date_time__date=today
    ).count()
    
    active_orders = ServiceOrder.objects.filter(
        branch=branch,
        status__in=['IN_PROGRESS', 'PENDING']
    ).count()
    
    awaiting_approval = ServiceOrder.objects.filter(
        branch=branch,
        status='PENDING' # simplified for example
    ).count()
    
    ready_for_delivery = ServiceOrder.objects.filter(
        branch=branch,
        status='COMPLETED'
    ).count()
    
    # Revenue this month
    start_of_month = today.replace(day=1)
    revenue_dict = Invoice.objects.filter(
        branch=branch, 
        status='PAID',
        created_at__date__gte=start_of_month
    ).aggregate(total=Sum('amount'))
    revenue = revenue_dict['total'] or 0
    
    # Outstanding payments
    outstanding_dict = Invoice.objects.filter(
        branch=branch,
        status='UNPAID'
    ).aggregate(total=Sum('amount'))
    outstanding = outstanding_dict['total'] or 0

    return Response({
        'vehiclesInWorkshop': vehicles_in_workshop,
        'appointmentsToday': appointments_today,
        'activeOrders': active_orders,
        'awaitingApproval': awaiting_approval,
        'readyForDelivery': ready_for_delivery,
        'revenue': float(revenue),
        'outstanding': float(outstanding)
    })

@api_view(['GET'])
@permission_classes([IsBranchManager])
def manager_alerts(request):
    branch = get_manager_branch(request.user)
    if not branch:
        return Response([])

    alerts = []
    
    # Delayed orders mock (simple logic: created > 2 days ago and still pending)
    delayed_orders = ServiceOrder.objects.filter(
        branch=branch, 
        status='IN_PROGRESS', 
        date_created__lt=timezone.now() - timedelta(days=2)
    )
    for order in delayed_orders:
        alerts.append({
            'id': f"del-{order.id}",
            'type': 'DELAY',
            'priority': 'HIGH',
            'title': 'Vehicle delayed',
            'description': f"{order.vehicle.make} {order.vehicle.model} - Service #{order.order_number}",
            'action': 'Investigate'
        })
        
    # Low inventory
    low_inventory = InventoryPart.objects.filter(branch=branch, current_stock__lte=models.F('minimum_level'))
    for part in low_inventory:
        alerts.append({
            'id': f"inv-{part.id}",
            'type': 'INVENTORY',
            'priority': 'MEDIUM',
            'title': 'Inventory shortage',
            'description': f"{part.name} - Stock: {part.current_stock}, Required: {part.minimum_level}",
            'action': 'View Inventory'
        })

    return Response(alerts)

from django.contrib.auth import get_user_model

User = get_user_model()

from .serializers_manager import (
    ManagerServiceOrderSerializer, ManagerAppointmentSerializer, 
    ManagerInventoryPartSerializer, ManagerInvoiceSerializer, 
    ManagerCustomerIssueSerializer, ManagerCustomerSerializer,
    ManagerTechnicianSerializer
)

class ManagerServiceOrderViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerServiceOrderSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        branch = get_manager_branch(self.request.user)
        if not branch:
            return ServiceOrder.objects.none()
        return ServiceOrder.objects.filter(branch=branch).select_related('vehicle', 'vehicle__owner', 'branch').prefetch_related('timeline', 'work_performed', 'parts_used')

class ManagerAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerAppointmentSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        branch = get_manager_branch(self.request.user)
        if not branch:
            return Appointment.objects.none()
        return Appointment.objects.filter(branch=branch).select_related('customer', 'vehicle', 'advisor')

class ManagerCustomerIssueViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerCustomerIssueSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        branch = get_manager_branch(self.request.user)
        if not branch:
            return CustomerIssue.objects.none()
        return CustomerIssue.objects.filter(branch=branch).select_related('customer', 'service_order', 'assigned_staff')

class ManagerInvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerInvoiceSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        branch = get_manager_branch(self.request.user)
        if not branch:
            return Invoice.objects.none()
        return Invoice.objects.filter(branch=branch).select_related('customer', 'vehicle', 'service_order')

class ManagerInventoryViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerInventoryPartSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        branch = get_manager_branch(self.request.user)
        if not branch:
            return InventoryPart.objects.none()
        return InventoryPart.objects.filter(branch=branch)

class ManagerCustomerViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerCustomerSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        branch = get_manager_branch(self.request.user)
        if not branch:
            return User.objects.none()
        from django.db.models import Q
        return User.objects.filter(Q(role='CUSTOMER') & (Q(branch=branch) | Q(vehicle__serviceorder__branch=branch) | Q(appointments__branch=branch))).distinct()

class ManagerTechnicianViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerTechnicianSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        branch = get_manager_branch(self.request.user)
        if not branch:
            return User.objects.none()
        return User.objects.filter(role='TECHNICIAN', branch=branch)

