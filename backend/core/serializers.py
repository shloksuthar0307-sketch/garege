from rest_framework import serializers
from .models import (
    Vehicle, VehicleHealthCategory, ServiceOrder, ServiceTimelineEvent, 
    ServiceWorkItem, ServicePart, MaintenanceItem, Warranty, VehicleDocument, Appointment
)

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['id', 'status', 'created_at']

class VehicleHealthCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleHealthCategory
        fields = ['id', 'name', 'score', 'warning']

class MaintenanceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceItem
        fields = ['id', 'title', 'due_text', 'status', 'is_urgent']

class WarrantySerializer(serializers.ModelSerializer):
    class Meta:
        model = Warranty
        fields = ['id', 'title', 'status', 'expires_date', 'coverage']

class VehicleDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleDocument
        fields = ['id', 'title', 'subtitle', 'date_added', 'file']

class VehicleSerializer(serializers.ModelSerializer):
    health_categories = VehicleHealthCategorySerializer(many=True, read_only=True)
    maintenance_items = MaintenanceItemSerializer(many=True, read_only=True)
    warranties = WarrantySerializer(many=True, read_only=True)
    documents = VehicleDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'make', 'model', 'year', 'registration_number', 'vin', 
            'fuel_type', 'transmission', 'color', 'mileage', 'health_score', 
            'health_status', 'image_url', 'health_categories', 'maintenance_items',
            'warranties', 'documents'
        ]
        read_only_fields = ['id', 'health_score', 'health_status']


class AdminVehicleSerializer(serializers.ModelSerializer):
    """Flat serializer for admin/manager vehicle management views."""
    owner_name = serializers.SerializerMethodField()
    last_service = serializers.SerializerMethodField()
    reg = serializers.CharField(source='registration_number', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'make', 'model', 'year', 'color', 'registration_number',
            'reg', 'vin', 'fuel_type', 'transmission', 'mileage',
            'health_score', 'health_status', 'image_url',
            'owner_name', 'last_service',
        ]

    def get_owner_name(self, obj):
        if obj.owner:
            name = f"{getattr(obj.owner, 'first_name', '')} {getattr(obj.owner, 'last_name', '')}".strip()
            return name or obj.owner.username or obj.owner.email
        return 'Unknown'

    def get_last_service(self, obj):
        so = obj.service_orders.order_by('-date_created').first()
        if so and so.date_created:
            return so.date_created.strftime('%Y-%m-%d')
        return None

class ServiceTimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTimelineEvent
        fields = ['id', 'title', 'time', 'completed']

class ServiceWorkItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceWorkItem
        fields = ['id', 'description']

class ServicePartSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePart
        fields = ['id', 'name']

class ServiceOrderSerializer(serializers.ModelSerializer):
    timeline = ServiceTimelineEventSerializer(many=True, read_only=True)
    work_performed = ServiceWorkItemSerializer(many=True, read_only=True)
    parts_used = ServicePartSerializer(many=True, read_only=True)
    order_number = serializers.CharField(read_only=True)
    vehicle_details = serializers.SerializerMethodField()

    class Meta:
        model = ServiceOrder
        fields = [
            'id', 'vehicle', 'vehicle_details', 'order_number', 'title', 'type', 'status', 'progress',
            'technician', 'advisor', 'branch', 'bay', 'parts_cost', 'labor_cost', 'tax', 
            'total_cost', 'date_created', 'date_completed', 'timeline', 'work_performed', 'parts_used'
        ]

    def get_vehicle_details(self, obj):
        if obj.vehicle:
            return {
                'make': obj.vehicle.make,
                'model': obj.vehicle.model,
                'registration_number': obj.vehicle.registration_number
            }
        return None

# --- PREMIUM CUSTOMER DASHBOARD SERIALIZERS ---
from .models import (
    CustomerProfile, SupportTicket, SupportMessage, Invoice,
    SubscriptionPlan, CustomerSubscription, NotificationPreference, PaymentMethod
)

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = '__all__'

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = '__all__'

class SupportMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportMessage
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    service = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    dueDate = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    vehicle_reg = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = '__all__'

    def get_vehicle_reg(self, obj):
        if obj.vehicle:
            return obj.vehicle.registration_number
        return ""

    def get_service(self, obj):
        if obj.service_order and obj.service_order.title:
            return obj.service_order.title
        elif obj.service_order:
            return f"Service #{obj.service_order.order_number}"
        return "Comprehensive Maintenance & Diagnostic"

    def get_date(self, obj):
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%d')
        return "N/A"

    def get_dueDate(self, obj):
        if obj.due_date:
            return obj.due_date.strftime('%Y-%m-%d')
        elif obj.created_at:
            from datetime import timedelta
            return (obj.created_at + timedelta(days=14)).strftime('%Y-%m-%d')
        return "N/A"

    def get_vehicle_name(self, obj):
        if obj.vehicle:
            return f"{obj.vehicle.year or ''} {obj.vehicle.make or ''} {obj.vehicle.model or ''}".strip()
        return "Vehicle"

    def get_customer_name(self, obj):
        if obj.customer:
            name = getattr(obj.customer, 'name', '') or f"{getattr(obj.customer, 'first_name', '')} {getattr(obj.customer, 'last_name', '')}".strip()
            return name or obj.customer.username or obj.customer.email
        return "Customer" 

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class CustomerSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerSubscription
        fields = '__all__'

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = '__all__'

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'
