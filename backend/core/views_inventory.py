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

from accounts.permissions import IsBranchManager
from core.utils import get_scoped_queryset

class InventoryDashboardAPI(APIView):
    permission_classes = [IsBranchManager]

    def get(self, request):
        qs = InventoryPart.objects.all()
        qs = get_scoped_queryset(qs, request.user)
        if not qs.exists():
            return Response({'detail': 'No branch access.'}, status=status.HTTP_400_BAD_REQUEST)
        
        parts = qs
        total_parts = parts.count()
        total_stock_units = parts.aggregate(total=Sum('current_stock'))['total'] or 0
        
        low_stock = parts.filter(current_stock__lte=F('minimum_level'), current_stock__gt=0).count()
        out_of_stock = parts.filter(current_stock=0).count()
        reserved_stock = parts.aggregate(total=Sum('reserved'))['total'] or 0
        
        today = timezone.now().date()
        received_today = StockMovement.objects.filter(
            part__in=parts, 
            movement_type='RECEIVED',
            timestamp__date=today
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        issued_today = StockMovement.objects.filter(
            part__in=parts, 
            movement_type='ISSUED',
            timestamp__date=today
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # parts waiting (service orders waiting for parts)
        req_qs = RequiredPart.objects.all()
        req_qs = get_scoped_queryset(req_qs, request.user, branch_lookup='service_order__branch')
        parts_waiting = req_qs.filter(
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
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        qs = InventoryPart.objects.all().order_by('name')
        return get_scoped_queryset(qs, self.request.user)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        qs = InventoryPart.objects.filter(current_stock__lte=F('minimum_level')).order_by('current_stock')
        parts = get_scoped_queryset(qs, request.user)
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
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        qs = StockReservation.objects.select_related('part', 'service_order', 'requested_by', 'reserved_by').order_by('-created_at')
        return get_scoped_queryset(qs, self.request.user, branch_lookup='part__branch')

    def create(self, request, *args, **kwargs):
        part_id = request.data.get('part')
        quantity = int(request.data.get('quantity', 0))
        service_order_id = request.data.get('service_order')
        
        if quantity <= 0:
            return Response({'detail': 'Quantity must be positive.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            with transaction.atomic():
                part_qs = get_scoped_queryset(InventoryPart.objects.all(), request.user)
                part = part_qs.select_for_update().get(id=part_id)
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
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        qs = StockMovement.objects.select_related('part', 'service_order', 'actor').order_by('-timestamp')
        return get_scoped_queryset(qs, self.request.user, branch_lookup='part__branch')

class RequiredPartViewSet(viewsets.ModelViewSet):
    serializer_class = RequiredPartSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        qs = RequiredPart.objects.select_related('service_order', 'part', 'technician').order_by('-created_at')
        return get_scoped_queryset(qs, self.request.user, branch_lookup='service_order__branch')

class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        qs = Supplier.objects.all().order_by('name')
        return get_scoped_queryset(qs, self.request.user)

class PurchaseRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        qs = PurchaseRequest.objects.select_related('part', 'branch').order_by('-created_at')
        return get_scoped_queryset(qs, self.request.user)

