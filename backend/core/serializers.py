from rest_framework import serializers
from .models import (
    Vehicle, VehicleHealthCategory, ServiceOrder, ServiceTimelineEvent, 
    ServiceWorkItem, ServicePart, MaintenanceItem, Warranty, VehicleDocument
)

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
        fields = ['id', 'title', 'subtitle', 'date_added']

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
        read_only_fields = ['id', 'vin', 'health_score', 'health_status']

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

    class Meta:
        model = ServiceOrder
        fields = [
            'id', 'vehicle', 'order_number', 'title', 'type', 'status', 'progress',
            'technician', 'advisor', 'workshop', 'parts_cost', 'labor_cost', 'tax', 
            'total_cost', 'date_created', 'date_completed', 'timeline', 'work_performed', 'parts_used'
        ]

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
    class Meta:
        model = Invoice
        fields = '__all__'

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
