from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Vehicle, ServiceOrder, Appointment, Invoice, CustomerIssue, 
    VehicleInspection, Estimate, EstimateItem, CustomerCommunication, FollowUpTask, AuditLog,
    VehicleDamage, Conversation, Message
)

User = get_user_model()

class AdvisorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'role', 'phone_number']

class TechnicianUserSerializer(serializers.ModelSerializer):
    active_jobs = serializers.SerializerMethodField()
    workload_percentage = serializers.SerializerMethodField()
    available = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'role', 'phone_number', 'active_jobs', 'workload_percentage', 'available']

    def get_active_jobs(self, obj):
        # mock or calculate from ServiceOrder
        name_str = f"{obj.first_name} {obj.last_name}".strip()
        return ServiceOrder.objects.filter(technician=name_str).exclude(status__in=['COMPLETED', 'CANCELLED']).count()
        
    def get_workload_percentage(self, obj):
        active = self.get_active_jobs(obj)
        return min(active * 25, 100)

    def get_available(self, obj):
        return self.get_workload_percentage(obj) < 100

class AdvisorVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'year', 'registration_number', 'vin', 'mileage']

class AdvisorAppointmentSerializer(serializers.ModelSerializer):
    customer = AdvisorUserSerializer(read_only=True)
    vehicle = AdvisorVehicleSerializer(read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'customer', 'vehicle', 'service_type', 'date_time', 'status', 'created_at']

class VehicleDamageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleDamage
        fields = '__all__'

class VehicleInspectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleInspection
        fields = '__all__'

class EstimateItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstimateItem
        fields = ['id', 'type', 'description', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['total_price']

class EstimateSerializer(serializers.ModelSerializer):
    items = EstimateItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Estimate
        fields = ['id', 'service_order', 'advisor', 'subtotal', 'tax', 'discount', 'total', 'status', 'sent_date', 'approved_date', 'created_at', 'validity_days', 'items']
        read_only_fields = ['subtotal', 'tax', 'total']

class CustomerCommunicationSerializer(serializers.ModelSerializer):
    actor = AdvisorUserSerializer(read_only=True)
    
    class Meta:
        model = CustomerCommunication
        fields = ['id', 'customer', 'service_order', 'actor', 'channel', 'message', 'is_customer_message', 'created_at']

class FollowUpTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUpTask
        fields = '__all__'

class AdvisorServiceOrderSerializer(serializers.ModelSerializer):
    vehicle = AdvisorVehicleSerializer(read_only=True)
    customer = serializers.SerializerMethodField()
    inspections = VehicleInspectionSerializer(many=True, read_only=True)
    service_estimate = EstimateSerializer(read_only=True)
    
    class Meta:
        model = ServiceOrder
        fields = [
            'id', 'order_number', 'title', 'type', 'status', 'progress', 
            'technician', 'advisor', 'bay', 'date_created', 'date_completed',
            'vehicle', 'customer', 'inspections', 'service_estimate', 'total_cost'
        ]

    def get_customer(self, obj):
        if obj.vehicle and obj.vehicle.owner:
            return AdvisorUserSerializer(obj.vehicle.owner).data
        return None

class MessageSenderSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'name', 'role']
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

class MessageSerializer(serializers.ModelSerializer):
    sender = MessageSenderSerializer(read_only=True)
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'attachment', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    customer = AdvisorUserSerializer(read_only=True)
    vehicle = AdvisorVehicleSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    latest_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'customer', 'vehicle', 'service_order', 'advisor', 'created_at', 'updated_at', 'unread_count', 'latest_message']
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.exclude(sender=request.user).filter(is_read=False).count()
        return obj.messages.filter(is_read=False).count()

    def get_latest_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

from .models import SystemNotification

class SystemNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemNotification
        fields = '__all__'
