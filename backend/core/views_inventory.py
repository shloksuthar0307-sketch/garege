from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count, F, Q
from django.db import transaction
from django.utils import timezone
from .models import (
    InventoryPart, StockReservation, StockMovement, 
    RequiredPart, Supplier, PurchaseRequest, ServiceOrder
)
from .serializers_inventory import (
    InventoryPartSerializer, StockReservationSerializer, 
    StockMovementSerializer, RequiredPartSerializer, 
    SupplierSerializer, PurchaseRequestSerializer
)
from organizations.models import Branch

class IsInventoryManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['INVENTORY_MANAGER', 'BRANCH_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN']

def get_branch(user):
    return user.branch

class InventoryDashboardAPI(APIView):
    permission_classes = [IsInventoryManagerOrAdmin]

    def get(self, request):
        branch = get_branch(request.user)
        if not branch:
            return Response({'detail': 'No branch assigned.'}, status=status.HTTP_400_BAD_REQUEST)
        
        parts = InventoryPart.objects.filter(branch=branch)
        total_parts = parts.count()
        total_stock_units = parts.aggregate(total=Sum('current_stock'))['total'] or 0
        
        low_stock = parts.filter(current_stock__lte=F('minimum_level'), current_stock__gt=0).count()
        out_of_stock = parts.filter(current_stock=0).count()
        reserved_stock = parts.aggregate(total=Sum('reserved'))['total'] or 0
        
        today = timezone.now().date()
        received_today = StockMovement.objects.filter(
            part__branch=branch, 
            movement_type='RECEIVED',
            timestamp__date=today
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        issued_today = StockMovement.objects.filter(
            part__branch=branch, 
            movement_type='ISSUED',
            timestamp__date=today
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # parts waiting (service orders waiting for parts)
        parts_waiting = RequiredPart.objects.filter(
            service_order__branch=branch,
            status='WAITING'
        ).count()

        return Response({
            'totalParts': total_parts,
            'totalStockUnits': total_stock_units,
            'lowStock': low_stock,
            'outOfStock': out_of_stock,
            'reservedStock': reserved_stock,
            'partsWaiting': parts_waiting,
            'receivedToday': received_today,
            'issuedToday': issued_today
        })

class InventoryPartViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryPartSerializer
    permission_classes = [IsInventoryManagerOrAdmin]

    def get_queryset(self):
        branch = get_branch(self.request.user)
        if not branch:
            return InventoryPart.objects.none()
        return InventoryPart.objects.filter(branch=branch).order_by('name')

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        branch = get_branch(request.user)
        parts = InventoryPart.objects.filter(branch=branch, current_stock__lte=F('minimum_level')).order_by('current_stock')
        return Response(self.get_serializer(parts, many=True).data)

    @action(detail=True, methods=['post'])
    def adjust(self, request, pk=None):
        part = self.get_object()
        quantity = int(request.data.get('quantity', 0))
        reason = request.data.get('reason', 'Manual Adjustment')
        
        if quantity == 0:
            return Response({'detail': 'Quantity must be non-zero.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            part = InventoryPart.objects.select_for_update().get(pk=part.pk)
            
            new_stock = part.current_stock + quantity
            if new_stock < 0:
                return Response({'detail': 'Cannot result in negative stock.'}, status=status.HTTP_400_BAD_REQUEST)
                
            StockMovement.objects.create(
                part=part,
                movement_type='ADJUSTED',
                quantity=quantity,
                quantity_before=part.current_stock,
                quantity_after=new_stock,
                actor=request.user,
                reason=reason
            )
            
            part.current_stock = new_stock
            part.save()
            
        return Response(self.get_serializer(part).data)

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        part = self.get_object()
        quantity = int(request.data.get('quantity', 0))
        notes = request.data.get('notes', '')
        
        if quantity <= 0:
            return Response({'detail': 'Quantity must be positive.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            part = InventoryPart.objects.select_for_update().get(pk=part.pk)
            
            new_stock = part.current_stock + quantity
                
            StockMovement.objects.create(
                part=part,
                movement_type='RECEIVED',
                quantity=quantity,
                quantity_before=part.current_stock,
                quantity_after=new_stock,
                actor=request.user,
                reason='Stock Receipt',
                notes=notes
            )
            
            part.current_stock = new_stock
            part.save()
            
        return Response(self.get_serializer(part).data)

class StockReservationViewSet(viewsets.ModelViewSet):
    serializer_class = StockReservationSerializer
    permission_classes = [IsInventoryManagerOrAdmin]

    def get_queryset(self):
        branch = get_branch(self.request.user)
        if not branch:
            return StockReservation.objects.none()
        return StockReservation.objects.filter(part__branch=branch).select_related('part', 'service_order', 'requested_by', 'reserved_by').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        part_id = request.data.get('part')
        quantity = int(request.data.get('quantity', 0))
        service_order_id = request.data.get('service_order')
        
        if quantity <= 0:
            return Response({'detail': 'Quantity must be positive.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            with transaction.atomic():
                part = InventoryPart.objects.select_for_update().get(id=part_id, branch=get_branch(request.user))
                service_order = ServiceOrder.objects.get(id=service_order_id)
                
                available = part.current_stock - part.reserved
                if available < quantity:
                    return Response({'detail': 'Insufficient available stock.'}, status=status.HTTP_400_BAD_REQUEST)
                    
                reservation = StockReservation.objects.create(
                    part=part,
                    quantity=quantity,
                    service_order=service_order,
                    requested_by=request.user,
                    reserved_by=request.user,
                    status='ACTIVE'
                )
                
                part.reserved += quantity
                part.save()
                
                StockMovement.objects.create(
                    part=part,
                    movement_type='RESERVED',
                    quantity=quantity,
                    quantity_before=part.current_stock,
                    quantity_after=part.current_stock,
                    service_order=service_order,
                    actor=request.user,
                    reason='Reserved for Service'
                )
                
                return Response(self.get_serializer(reservation).data, status=status.HTTP_201_CREATED)
        except InventoryPart.DoesNotExist:
            return Response({'detail': 'Part not found.'}, status=status.HTTP_404_NOT_FOUND)
        except ServiceOrder.DoesNotExist:
            return Response({'detail': 'Service order not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def release(self, request, pk=None):
        try:
            with transaction.atomic():
                reservation = StockReservation.objects.select_for_update().get(pk=pk)
                if reservation.status != 'ACTIVE':
                    return Response({'detail': 'Reservation is not active.'}, status=status.HTTP_400_BAD_REQUEST)
                
                part = InventoryPart.objects.select_for_update().get(pk=reservation.part.pk)
                
                part.reserved -= reservation.quantity
                if part.reserved < 0:
                    part.reserved = 0
                part.save()
                
                reservation.status = 'RELEASED'
                reservation.save()
                
                StockMovement.objects.create(
                    part=part,
                    movement_type='RELEASED',
                    quantity=reservation.quantity,
                    quantity_before=part.current_stock,
                    quantity_after=part.current_stock,
                    service_order=reservation.service_order,
                    actor=request.user,
                    reason='Reservation Released'
                )
                
                return Response(self.get_serializer(reservation).data)
        except StockReservation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def issue(self, request, pk=None):
        try:
            with transaction.atomic():
                reservation = StockReservation.objects.select_for_update().get(pk=pk)
                if reservation.status != 'ACTIVE':
                    return Response({'detail': 'Reservation is not active.'}, status=status.HTTP_400_BAD_REQUEST)
                
                part = InventoryPart.objects.select_for_update().get(pk=reservation.part.pk)
                
                new_stock = part.current_stock - reservation.quantity
                if new_stock < 0:
                    return Response({'detail': 'Cannot issue, insufficient stock.'}, status=status.HTTP_400_BAD_REQUEST)
                
                part.current_stock = new_stock
                part.reserved -= reservation.quantity
                if part.reserved < 0:
                    part.reserved = 0
                part.save()
                
                reservation.status = 'USED'
                reservation.save()
                
                StockMovement.objects.create(
                    part=part,
                    movement_type='ISSUED',
                    quantity=reservation.quantity,
                    quantity_before=new_stock + reservation.quantity,
                    quantity_after=new_stock,
                    service_order=reservation.service_order,
                    actor=request.user,
                    reason='Issued to Technician'
                )
                
                return Response(self.get_serializer(reservation).data)
        except StockReservation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockMovementSerializer
    permission_classes = [IsInventoryManagerOrAdmin]

    def get_queryset(self):
        branch = get_branch(self.request.user)
        if not branch:
            return StockMovement.objects.none()
        return StockMovement.objects.filter(part__branch=branch).select_related('part', 'service_order', 'actor').order_by('-timestamp')

class RequiredPartViewSet(viewsets.ModelViewSet):
    serializer_class = RequiredPartSerializer
    permission_classes = [IsInventoryManagerOrAdmin]

    def get_queryset(self):
        branch = get_branch(self.request.user)
        if not branch:
            return RequiredPart.objects.none()
        return RequiredPart.objects.filter(service_order__branch=branch).select_related('service_order', 'part', 'technician').order_by('-created_at')

class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [IsInventoryManagerOrAdmin]

    def get_queryset(self):
        branch = get_branch(self.request.user)
        if not branch:
            return Supplier.objects.none()
        return Supplier.objects.filter(branch=branch).order_by('name')

class PurchaseRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsInventoryManagerOrAdmin]

    def get_queryset(self):
        branch = get_branch(self.request.user)
        if not branch:
            return PurchaseRequest.objects.none()
        return PurchaseRequest.objects.filter(branch=branch).select_related('part', 'branch').order_by('-created_at')

