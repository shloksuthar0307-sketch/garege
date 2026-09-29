from rest_framework import serializers
from .models import (
    ServiceOrder, Vehicle, VehicleInspection, InspectionItem, 
    Issue, IssueEvidence, DiagnosticFinding, RepairTask, 
    RepairProgress, ServiceTimelineEvent, InventoryPart
)
from django.contrib.auth import get_user_model

User = get_user_model()

class TechnicianVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'year', 'registration_number', 'vin', 'mileage']

class TechnicianServiceOrderListSerializer(serializers.ModelSerializer):
    vehicle = TechnicianVehicleSerializer(read_only=True)
    
    class Meta:
        model = ServiceOrder
        fields = ['id', 'order_number', 'title', 'type', 'status', 'progress', 'vehicle', 'advisor', 'bay', 'date_created']

class TechnicianServiceOrderDetailSerializer(serializers.ModelSerializer):
    vehicle = TechnicianVehicleSerializer(read_only=True)
    
    class Meta:
        model = ServiceOrder
        fields = ['id', 'order_number', 'title', 'type', 'status', 'progress', 'vehicle', 'advisor', 'bay', 'date_created']

class TechnicianIssueEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueEvidence
        fields = ['id', 'file_url', 'file_type', 'description', 'timestamp']

class TechnicianIssueSerializer(serializers.ModelSerializer):
    evidence = TechnicianIssueEvidenceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Issue
        fields = ['id', 'component', 'issue_type', 'severity', 'description', 'measurement', 'recommendation', 'evidence', 'is_additional', 'created_at']

class TechnicianInspectionItemSerializer(serializers.ModelSerializer):
    issues = TechnicianIssueSerializer(many=True, read_only=True)
    
    class Meta:
        model = InspectionItem
        fields = ['id', 'category', 'name', 'status', 'notes', 'issues']

class TechnicianInspectionSerializer(serializers.ModelSerializer):
    items = TechnicianInspectionItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = VehicleInspection
        fields = ['id', 'exterior_notes', 'interior_notes', 'warning_lights', 'fuel_level', 'mileage', 'customer_concern', 'items', 'created_at']

class TechnicianRepairProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairProgress
        fields = ['id', 'percentage', 'note', 'timestamp']

class TechnicianRepairTaskSerializer(serializers.ModelSerializer):
    progress_updates = TechnicianRepairProgressSerializer(many=True, read_only=True)
    
    class Meta:
        model = RepairTask
        fields = ['id', 'name', 'description', 'status', 'created_at', 'started_at', 'completed_at', 'blocked_reason', 'progress_updates']

class TechnicianTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTimelineEvent
        fields = ['id', 'title', 'time', 'completed']


class LaborSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__('core.models').models.LaborSession
        fields = '__all__'

class DiagnosticScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__('core.models').models.DiagnosticScan
        fields = '__all__'

class DiagnosticCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__('core.models').models.DiagnosticCode
        fields = '__all__'

class TechnicianNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__('core.models').models.TechnicianNotification
        fields = '__all__'

class OfflineSyncEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__('core.models').models.OfflineSyncEvent
        fields = '__all__'
