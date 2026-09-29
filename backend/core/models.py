from django.db import models
from django.conf import settings
import uuid

class Vehicle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles', null=True, blank=True)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    registration_number = models.CharField(max_length=50)
    vin = models.CharField(max_length=50, unique=True)
    fuel_type = models.CharField(max_length=50, blank=True, null=True)
    transmission = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    mileage = models.IntegerField(default=0)
    health_score = models.IntegerField(default=100)
    health_status = models.CharField(max_length=100, default='Good Condition')
    image_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.make} {self.model} ({self.registration_number})"

class VehicleHealthCategory(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='health_categories')
    name = models.CharField(max_length=100) # Engine, Brakes, Tires, etc.
    score = models.IntegerField()
    warning = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.score}%"

class ServiceOrder(models.Model):
    STATUS_CHOICES = (
        ('CHECKED_IN', 'Checked In'),
        ('DIAGNOSIS', 'Diagnosis'),
        ('AWAITING_APPROVAL', 'Awaiting Approval'),
        ('AWAITING_PARTS', 'Parts Pending'),
        ('IN_WORKSHOP', 'In Workshop'),
        ('QUALITY_CHECK', 'Quality Check'),
        ('READY_FOR_PICKUP', 'Ready for Pickup'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='service_orders')
    order_number = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=100) # Maintenance, Repair, Inspection, Warranty
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='CHECKED_IN')
    progress = models.IntegerField(default=0)
    technician = models.CharField(max_length=100, blank=True, null=True)
    advisor = models.CharField(max_length=100, blank=True, null=True)
    branch = models.ForeignKey('organizations.Branch', on_delete=models.SET_NULL, null=True, blank=True, related_name='service_orders')
    bay = models.CharField(max_length=50, blank=True, null=True)
    
    # Costs
    parts_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.order_number} - {self.title}"

class ServiceTimelineEvent(models.Model):
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='timeline')
    title = models.CharField(max_length=255)
    time = models.DateTimeField()
    completed = models.BooleanField(default=True)

    class Meta:
        ordering = ['time']

class ServiceWorkItem(models.Model):
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='work_performed')
    description = models.CharField(max_length=255)

class ServicePart(models.Model):
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='parts_used')
    name = models.CharField(max_length=255)

class MaintenanceItem(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenance_items')
    title = models.CharField(max_length=255)
    due_text = models.CharField(max_length=100) # e.g. "800 km remaining"
    status = models.CharField(max_length=50) # e.g. "Due Soon", "Upcoming"
    is_urgent = models.BooleanField(default=False)

class Warranty(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='warranties')
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=50) # Active, Expires Soon
    expires_date = models.DateField(blank=True, null=True)
    coverage = models.CharField(max_length=100, blank=True, null=True)

class VehicleDocument(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True)

class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('organizations.Branch', on_delete=models.CASCADE, related_name='appointments', null=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='appointments')
    service_type = models.CharField(max_length=100)
    advisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_appointments')
    date_time = models.DateTimeField()
    status = models.CharField(max_length=50, default='REQUESTED')
    created_at = models.DateTimeField(auto_now_add=True)

class InventoryPart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('organizations.Branch', on_delete=models.CASCADE, related_name='inventory')
    part_number = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    current_stock = models.IntegerField(default=0)
    reserved = models.IntegerField(default=0)
    minimum_level = models.IntegerField(default=5)
    supplier = models.CharField(max_length=255, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

class PurchaseRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('organizations.Branch', on_delete=models.CASCADE, related_name='purchase_requests')
    part = models.ForeignKey(InventoryPart, on_delete=models.CASCADE, related_name='requests')
    quantity = models.IntegerField()
    supplier = models.CharField(max_length=255, blank=True, null=True)
    priority = models.CharField(max_length=50, default='NORMAL')
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='DRAFT')
    created_at = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('organizations.Branch', on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invoices')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='invoices')
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.SET_NULL, null=True, related_name='invoices')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=50, default='UNPAID')
    due_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class CustomerIssue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('organizations.Branch', on_delete=models.CASCADE, related_name='customer_issues')
    ticket_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='issues')
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues')
    category = models.CharField(max_length=100)
    priority = models.CharField(max_length=50, default='NORMAL')
    description = models.TextField()
    assigned_staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    status = models.CharField(max_length=50, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)



class VehicleInspection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='inspections')
    advisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='conducted_inspections')
    exterior_notes = models.TextField(blank=True, null=True)
    interior_notes = models.TextField(blank=True, null=True)
    warning_lights = models.CharField(max_length=255, blank=True, null=True)
    fuel_level = models.CharField(max_length=50, blank=True, null=True)
    mileage = models.IntegerField(default=0)
    customer_concern = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Estimate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_order = models.OneToOneField(ServiceOrder, on_delete=models.CASCADE, related_name='service_estimate')
    advisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_estimates')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=50, default='DRAFT') # DRAFT, SENT, VIEWED, APPROVED, DECLINED, EXPIRED
    sent_date = models.DateTimeField(blank=True, null=True)
    approved_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    validity_days = models.IntegerField(default=7)

class EstimateItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, related_name='items')
    type = models.CharField(max_length=50) # PARTS, LABOR, OTHER
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

class CustomerCommunication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='communications')
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='communications', null=True, blank=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sent_communications')
    channel = models.CharField(max_length=50) # CHAT, EMAIL, SMS, PHONE
    message = models.TextField()
    is_customer_message = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class FollowUpTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='follow_ups')
    advisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='follow_ups')
    reason = models.CharField(max_length=255)
    due_time = models.DateTimeField()
    priority = models.CharField(max_length=50, default='NORMAL')
    status = models.CharField(max_length=50, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=255)
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class InspectionItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inspection = models.ForeignKey(VehicleInspection, on_delete=models.CASCADE, related_name='items')
    category = models.CharField(max_length=100) # e.g. EXTERIOR, BRAKING SYSTEM
    name = models.CharField(max_length=100) # e.g. Front Left Tire
    status = models.CharField(max_length=50, default='PENDING') # PENDING, GOOD, NEEDS_ATTENTION, CRITICAL
    notes = models.TextField(blank=True, null=True)

class Issue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='reported_issues')
    inspection_item = models.ForeignKey(InspectionItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues')
    component = models.CharField(max_length=100)
    issue_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=50) # CRITICAL, NEEDS_ATTENTION
    description = models.TextField()
    measurement = models.CharField(max_length=100, blank=True, null=True)
    recommendation = models.TextField(blank=True, null=True)
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='reported_issues')
    created_at = models.DateTimeField(auto_now_add=True)
    is_additional = models.BooleanField(default=False)

class IssueEvidence(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='evidence')
    file_url = models.URLField(max_length=500)
    file_type = models.CharField(max_length=50) # image, video, document
    description = models.CharField(max_length=255, blank=True, null=True)
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class DiagnosticFinding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='diagnostics')
    component = models.CharField(max_length=100)
    finding = models.TextField()
    severity = models.CharField(max_length=50)
    recommendation = models.TextField()
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class RepairTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='repair_tasks')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='NOT_STARTED') # NOT_STARTED, IN_PROGRESS, BLOCKED, WAITING_FOR_PARTS, COMPLETED
    assigned_technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='assigned_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    blocked_reason = models.TextField(blank=True, null=True)

class RepairProgress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(RepairTask, on_delete=models.CASCADE, related_name='progress_updates')
    percentage = models.IntegerField(default=0)
    note = models.TextField(blank=True, null=True)
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class TechnicianAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='technician_assignments')
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_work')
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)



# --- INVENTORY MANAGER ADDITIONS ---

class Supplier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('organizations.Branch', on_delete=models.CASCADE, related_name='suppliers', null=True, blank=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    contact_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

class StockLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('organizations.Branch', on_delete=models.CASCADE, related_name='stock_locations')
    name = models.CharField(max_length=100) # Warehouse A
    description = models.TextField(blank=True, null=True)

class StockReservation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    part = models.ForeignKey('InventoryPart', on_delete=models.CASCADE, related_name='reservations')
    quantity = models.IntegerField()
    service_order = models.ForeignKey('ServiceOrder', on_delete=models.CASCADE, related_name='part_reservations')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='requested_reservations')
    reserved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_reservations')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, default='ACTIVE') # ACTIVE, USED, RELEASED, EXPIRED, CANCELLED

class StockMovement(models.Model):
    MOVEMENT_TYPES = (
        ('RECEIVED', 'Received'),
        ('RESERVED', 'Reserved'),
        ('RELEASED', 'Released'),
        ('ISSUED', 'Issued'),
        ('RETURNED', 'Returned'),
        ('ADJUSTED', 'Adjusted'),
        ('TRANSFERRED', 'Transferred'),
        ('DAMAGED', 'Damaged'),
        ('CANCELLED', 'Cancelled'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    part = models.ForeignKey('InventoryPart', on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=50, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    quantity_before = models.IntegerField()
    quantity_after = models.IntegerField()
    service_order = models.ForeignKey('ServiceOrder', on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_movements')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    reason = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class RequiredPart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_order = models.ForeignKey('ServiceOrder', on_delete=models.CASCADE, related_name='required_parts')
    part = models.ForeignKey('InventoryPart', on_delete=models.CASCADE, related_name='requirements')
    quantity_required = models.IntegerField(default=1)
    status = models.CharField(max_length=50, default='WAITING') # WAITING, RESERVED, ISSUED, PARTIALLY_AVAILABLE, UNAVAILABLE
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

# --- TECHNICIAN WORKSPACE MODELS ---

class LaborSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='labor_sessions')
    service_order = models.ForeignKey('ServiceOrder', on_delete=models.CASCADE, related_name='labor_sessions')
    repair_task = models.ForeignKey('RepairTask', on_delete=models.SET_NULL, null=True, blank=True, related_name='labor_sessions')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    paused_duration = models.IntegerField(default=0) # in seconds
    active_duration = models.IntegerField(default=0) # in seconds
    status = models.CharField(max_length=50, default='ACTIVE') # ACTIVE, PAUSED, COMPLETED
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class DiagnosticScan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey('Vehicle', on_delete=models.CASCADE, related_name='diagnostic_scans')
    service_order = models.ForeignKey('ServiceOrder', on_delete=models.CASCADE, related_name='diagnostic_scans', null=True, blank=True)
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='diagnostic_scans')
    status = models.CharField(max_length=50, default='PENDING') # PENDING, COMPLETED, FAILED
    source = models.CharField(max_length=50, default='OBD2') # OBD2, VIN, MANUAL
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class DiagnosticCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scan = models.ForeignKey(DiagnosticScan, on_delete=models.CASCADE, related_name='codes')
    code = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    system = models.CharField(max_length=100, blank=True, null=True)
    severity = models.CharField(max_length=50, default='UNKNOWN')
    status = models.CharField(max_length=50, default='ACTIVE') # ACTIVE, CLEARED, HISTORIC

class TechnicianNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='technician_notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sent_technician_notifications')
    event_type = models.CharField(max_length=100)
    message = models.TextField()
    service_order = models.ForeignKey('ServiceOrder', on_delete=models.SET_NULL, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

class OfflineSyncEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sync_events')
    action = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='PENDING') # PENDING, SYNCED, FAILED
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)

class VehicleDamage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='damages')
    inspection = models.ForeignKey(VehicleInspection, on_delete=models.SET_NULL, null=True, blank=True, related_name='damages')
    zone = models.CharField(max_length=100)
    mesh_identifier = models.CharField(max_length=100)
    damage_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=50) # Minor, Moderate, Severe, Critical
    description = models.TextField()
    estimated_hours = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50) # Open, Repaired
    world_position_x = models.FloatField()
    world_position_y = models.FloatField()
    world_position_z = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class GeneratedDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document_type = models.CharField(max_length=100)
    estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='documents/')
    version = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_conversations')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True)
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.SET_NULL, null=True, blank=True)
    advisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='advisor_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    attachment = models.FileField(upload_to='messages/', null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

# --- PREMIUM CUSTOMER DASHBOARD MODELS ---

class CustomerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_profile')
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    loyalty_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

class SupportTicket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_tickets')
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=50, default='OPEN') # OPEN, IN_PROGRESS, RESOLVED, CLOSED
    priority = models.CharField(max_length=50, default='NORMAL') # LOW, NORMAL, HIGH, URGENT
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

class SupportMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_support_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    features = models.JSONField(default=list) # e.g. ["Priority Support", "Free Oil Change"]
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ${self.price}"

class CustomerSubscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True, related_name='subscribers')
    status = models.CharField(max_length=50, default='ACTIVE') # ACTIVE, CANCELLED, EXPIRED
    start_date = models.DateTimeField(auto_now_add=True)
    next_billing_date = models.DateTimeField(blank=True, null=True)

class NotificationPreference(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preferences')
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    push_enabled = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

class PaymentMethod(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_methods')
    provider = models.CharField(max_length=50) # e.g. STRIPE, PAYPAL
    last4 = models.CharField(max_length=4)
    exp_month = models.IntegerField(blank=True, null=True)
    exp_year = models.IntegerField(blank=True, null=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)



class SystemNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20) # ALERT, INFO, MESSAGE, SYSTEM
    title = models.CharField(max_length=255)
    message = models.TextField()
    action_url = models.CharField(max_length=255, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
class VehicleQRCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='qr_codes')
    token = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_scanned_at = models.DateTimeField(null=True, blank=True)
    scan_count = models.IntegerField(default=0)
    revoked_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_qrs')

class TechnicianPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='photos')
    service_order = models.ForeignKey('ServiceOrder', on_delete=models.CASCADE, related_name='photos', null=True, blank=True)
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    inspection = models.ForeignKey('VehicleInspection', on_delete=models.CASCADE, related_name='tech_photos', null=True, blank=True)
    image = models.ImageField(upload_to='inspection_photos/')
    vehicle_area = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class AIFinding(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('REJECTED', 'Rejected'),
        ('EDITED', 'Edited'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    photo = models.ForeignKey(TechnicianPhoto, on_delete=models.CASCADE, related_name='ai_findings')
    vehicle_area = models.CharField(max_length=100)
    issue_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=50)
    confidence = models.FloatField()
    description = models.TextField()
    recommended_action = models.TextField(blank=True, null=True)
    estimated_priority = models.CharField(max_length=50, blank=True, null=True)
    bounding_box = models.JSONField(blank=True, null=True)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    
    diagnostic_finding = models.OneToOneField('DiagnosticFinding', on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_source')
    created_at = models.DateTimeField(auto_now_add=True)

class AIUsageLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True)
    provider = models.CharField(max_length=50)
    model_name = models.CharField(max_length=100)
    request_time = models.DateTimeField(auto_now_add=True)
    processing_status = models.CharField(max_length=50)
    token_usage = models.IntegerField(default=0)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=4, default=0)
