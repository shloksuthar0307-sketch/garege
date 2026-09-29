from rest_framework import serializers
from .models import (
    InventoryPart, StockReservation, StockMovement, 
    RequiredPart, Supplier, PurchaseRequest, ServiceOrder, Vehicle,
    StockLocation
)
from django.contrib.auth import get_user_model

User = get_user_model()

class InvVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'registration_number', 'vin']

class InvServiceOrderSerializer(serializers.ModelSerializer):
    vehicle_details = InvVehicleSerializer(source='vehicle', read_only=True)
    advisor_name = serializers.CharField(source='advisor', read_only=True)
    technician_name = serializers.CharField(source='technician', read_only=True)

    class Meta:
        model = ServiceOrder
        fields = ['id', 'order_number', 'title', 'status', 'vehicle_details', 'advisor_name', 'technician_name', 'date_created']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class InventoryPartSerializer(serializers.ModelSerializer):
    available_stock = serializers.SerializerMethodField()

    class Meta:
        model = InventoryPart
        fields = '__all__'

    def get_available_stock(self, obj):
        return max(0, obj.current_stock - obj.reserved)

class StockReservationSerializer(serializers.ModelSerializer):
    part_details = InventoryPartSerializer(source='part', read_only=True)
    service_order_details = InvServiceOrderSerializer(source='service_order', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True, default='')
    reserved_by_name = serializers.CharField(source='reserved_by.get_full_name', read_only=True, default='')

    class Meta:
        model = StockReservation
        fields = '__all__'

class StockMovementSerializer(serializers.ModelSerializer):
    part_details = InventoryPartSerializer(source='part', read_only=True)
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True, default='')
    service_order_number = serializers.CharField(source='service_order.order_number', read_only=True, default='')

    class Meta:
        model = StockMovement
        fields = '__all__'

class RequiredPartSerializer(serializers.ModelSerializer):
    part_details = InventoryPartSerializer(source='part', read_only=True)
    service_order_details = InvServiceOrderSerializer(source='service_order', read_only=True)
    technician_name = serializers.CharField(source='technician.get_full_name', read_only=True, default='')

    class Meta:
        model = RequiredPart
        fields = '__all__'

class PurchaseRequestSerializer(serializers.ModelSerializer):
    part_details = InventoryPartSerializer(source='part', read_only=True)
    
    class Meta:
        model = PurchaseRequest
        fields = '__all__'
