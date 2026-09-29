from rest_framework import serializers
from .models import ServiceOrder, Appointment, InventoryPart, PurchaseRequest, Invoice, CustomerIssue, Vehicle
from django.contrib.auth import get_user_model

User = get_user_model()

class ManagerVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'registration_number', 'vin']

class ManagerServiceOrderSerializer(serializers.ModelSerializer):
    vehicle_details = ManagerVehicleSerializer(source='vehicle', read_only=True)
    
    class Meta:
        model = ServiceOrder
        fields = '__all__'

class ManagerAppointmentSerializer(serializers.ModelSerializer):
    vehicle_details = ManagerVehicleSerializer(source='vehicle', read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'

class ManagerInventoryPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryPart
        fields = '__all__'

class ManagerInvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    class Meta:
        model = Invoice
        fields = '__all__'

class ManagerCustomerIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerIssue
        fields = '__all__'

class ManagerTechnicianSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone_number', 'is_active', 'date_joined']

class ManagerCustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    vehicles_count = serializers.IntegerField(source='vehicle_set.count', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone_number', 'date_joined', 'vehicles_count']
