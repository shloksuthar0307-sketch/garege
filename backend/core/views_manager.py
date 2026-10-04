from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, F
from django.db import models
from django.utils import timezone
from datetime import timedelta
from accounts.permissions import IsBranchManager
from accounts.models import Role

from .models import (
    Vehicle, ServiceOrder, Appointment, InventoryPart, 
    PurchaseRequest, Invoice, CustomerIssue
)
from organizations.models import Branch

def get_manager_branch(user):
    return getattr(user, 'branch', None)

@api_view(['GET'])
@permission_classes([IsBranchManager])
def manager_dashboard_kpis(request):
    branch_id = request.query_params.get('branch')
    if branch_id:
        branch = Branch.objects.filter(id=branch_id).first()
        if not branch or (request.user.role == Role.ORG_ADMIN and branch.organization != request.user.organization):
            return Response({'detail': 'Unauthorized branch.'}, status=status.HTTP_403_FORBIDDEN)
    else:
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
    branch_id = request.query_params.get('branch')
    if branch_id:
        branch = Branch.objects.filter(id=branch_id).first()
        if not branch or (request.user.role == Role.ORG_ADMIN and branch.organization != request.user.organization):
            return Response({'detail': 'Unauthorized branch.'}, status=status.HTTP_403_FORBIDDEN)
    else:
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

@api_view(['POST'])
@permission_classes([IsBranchManager])
def invite_staff(request):
    import uuid
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    branch_id = request.data.get('branch')
    if branch_id:
        branch = Branch.objects.filter(id=branch_id).first()
        if not branch or (request.user.role == Role.ORG_ADMIN and branch.organization != request.user.organization):
            return Response({'detail': 'Unauthorized branch.'}, status=status.HTTP_403_FORBIDDEN)
    else:
        branch = get_manager_branch(request.user)
        
    if not branch:
        return Response({'detail': 'Branch is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    role = request.data.get('role')
    
    if not email or not role:
        return Response({'detail': 'Email and role are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if role not in [Role.SERVICE_ADVISOR, Role.TECHNICIAN, Role.INVENTORY_MANAGER, Role.BRANCH_MANAGER]:
        return Response({'detail': 'Invalid role for branch.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(email=email).exists():
        return Response({'detail': 'User with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
    temporary_password = User.objects.make_random_password()
    username = email.split('@')[0] + str(uuid.uuid4())[:4]
    
    new_user = User.objects.create_user(
        username=username,
        email=email,
        password=temporary_password,
        first_name=first_name,
        last_name=last_name,
        role=role,
        branch=branch,
        organization=branch.organization
    )
    
    return Response({
        'detail': 'Staff invited successfully.',
        'user': {
            'id': new_user.id,
            'email': new_user.email,
            'role': new_user.role,
        },
        'temporary_password': temporary_password
    }, status=status.HTTP_201_CREATED)

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
        user = self.request.user
        qs = ServiceOrder.objects.select_related('vehicle', 'vehicle__owner', 'branch').prefetch_related('timeline', 'work_performed', 'parts_used')
        if user.role == Role.SUPER_ADMIN:
            return qs
        elif user.role == Role.ORG_ADMIN and user.organization:
            return qs.filter(branch__organization=user.organization)
        elif user.branch:
            return qs.filter(branch=user.branch)
        return qs.none()

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        branch = serializer.validated_data.get('branch')
        if not branch:
            branch = get_manager_branch(user)
            
        if user.role == Role.ORG_ADMIN and branch.organization != user.organization:
            raise PermissionDenied("Branch must be in your organization.")
        elif user.role in [Role.BRANCH_MANAGER, Role.SERVICE_ADVISOR] and branch != user.branch:
            raise PermissionDenied("You can only create items for your own branch.")
            
        serializer.save(branch=branch)

class ManagerAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerAppointmentSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related('customer', 'vehicle', 'advisor')
        if user.role == Role.SUPER_ADMIN:
            return qs
        elif user.role == Role.ORG_ADMIN and user.organization:
            return qs.filter(branch__organization=user.organization)
        elif user.branch:
            return qs.filter(branch=user.branch)
        return qs.none()

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        branch = serializer.validated_data.get('branch')
        if not branch:
            branch = get_manager_branch(user)
            
        if user.role == Role.ORG_ADMIN and branch.organization != user.organization:
            raise PermissionDenied("Branch must be in your organization.")
        elif user.role in [Role.BRANCH_MANAGER, Role.SERVICE_ADVISOR] and branch != user.branch:
            raise PermissionDenied("You can only create items for your own branch.")
            
        serializer.save(branch=branch)

class ManagerCustomerIssueViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerCustomerIssueSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        user = self.request.user
        qs = CustomerIssue.objects.select_related('customer', 'service_order', 'assigned_staff')
        if user.role == Role.SUPER_ADMIN:
            return qs
        elif user.role == Role.ORG_ADMIN and user.organization:
            return qs.filter(branch__organization=user.organization)
        elif user.branch:
            return qs.filter(branch=user.branch)
        return qs.none()

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        branch = serializer.validated_data.get('branch')
        if not branch:
            branch = get_manager_branch(user)
            
        if user.role == Role.ORG_ADMIN and branch.organization != user.organization:
            raise PermissionDenied("Branch must be in your organization.")
        elif user.role in [Role.BRANCH_MANAGER, Role.SERVICE_ADVISOR] and branch != user.branch:
            raise PermissionDenied("You can only create items for your own branch.")
            
        serializer.save(branch=branch)

class ManagerInvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerInvoiceSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        user = self.request.user
        qs = Invoice.objects.select_related('customer', 'vehicle', 'service_order')
        if user.role == Role.SUPER_ADMIN:
            return qs
        elif user.role == Role.ORG_ADMIN and user.organization:
            return qs.filter(branch__organization=user.organization)
        elif user.branch:
            return qs.filter(branch=user.branch)
        return qs.none()

    def perform_create(self, serializer):
        import uuid
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        branch = serializer.validated_data.get('branch')
        if not branch:
            branch = get_manager_branch(user)
            
        if user.role == Role.ORG_ADMIN and branch.organization != user.organization:
            raise PermissionDenied("Branch must be in your organization.")
        elif user.role in [Role.BRANCH_MANAGER, Role.SERVICE_ADVISOR] and branch != user.branch:
            raise PermissionDenied("You can only create items for your own branch.")
            
        invoice_number = f"INV-{str(uuid.uuid4())[:6].upper()}"
        serializer.save(branch=branch, invoice_number=invoice_number)

class ManagerInventoryViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerInventoryPartSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        user = self.request.user
        qs = InventoryPart.objects.all()
        if user.role == Role.SUPER_ADMIN:
            return qs
        elif user.role == Role.ORG_ADMIN and user.organization:
            return qs.filter(branch__organization=user.organization)
        elif user.branch:
            return qs.filter(branch=user.branch)
        return qs.none()

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        branch = serializer.validated_data.get('branch')
        if not branch:
            branch = get_manager_branch(user)
            
        if user.role == Role.ORG_ADMIN and branch.organization != user.organization:
            raise PermissionDenied("Branch must be in your organization.")
        elif user.role in [Role.BRANCH_MANAGER, Role.SERVICE_ADVISOR] and branch != user.branch:
            raise PermissionDenied("You can only create items for your own branch.")
            
        serializer.save(branch=branch)

class ManagerCustomerViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerCustomerSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.filter(role='CUSTOMER')
        if user.role == Role.SUPER_ADMIN:
            return qs
        elif user.role == Role.ORG_ADMIN and user.organization:
            from django.db.models import Q
            return qs.filter(Q(branch__organization=user.organization) | Q(vehicle__service_orders__branch__organization=user.organization) | Q(appointments__branch__organization=user.organization)).distinct()
        elif user.branch:
            from django.db.models import Q
            return qs.filter(Q(branch=user.branch) | Q(vehicle__service_orders__branch=user.branch) | Q(appointments__branch=user.branch)).distinct()
        return qs.none()

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        branch = serializer.validated_data.get('branch')
        organization = serializer.validated_data.get('organization')
        
        if user.role == Role.ORG_ADMIN:
            organization = user.organization
            if branch and branch.organization != organization:
                raise PermissionDenied("Branch must be in your organization.")
        elif user.role in [Role.BRANCH_MANAGER, Role.SERVICE_ADVISOR]:
            branch = user.branch
            organization = user.organization or (branch.organization if branch else None)
            
        serializer.save(branch=branch, organization=organization)

class ManagerTechnicianViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerTechnicianSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.filter(role='TECHNICIAN')
        if user.role == Role.SUPER_ADMIN:
            return qs
        elif user.role == Role.ORG_ADMIN and user.organization:
            return qs.filter(organization=user.organization)
        elif user.branch:
            return qs.filter(branch=user.branch)
        return qs.none()

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        branch = serializer.validated_data.get('branch')
        organization = serializer.validated_data.get('organization')
        
        if user.role == Role.ORG_ADMIN:
            organization = user.organization
            if branch and branch.organization != organization:
                raise PermissionDenied("Branch must be in your organization.")
        elif user.role in [Role.BRANCH_MANAGER, Role.SERVICE_ADVISOR]:
            branch = user.branch
            organization = user.organization or (branch.organization if branch else None)
            
        serializer.save(branch=branch, organization=organization)


