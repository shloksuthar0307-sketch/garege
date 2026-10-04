from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import ServiceOrder, VehicleDamage, AuditLog, SystemNotification, Vehicle, Appointment, TechnicianAssignment, TechnicianNotification, RepairTask, RepairProgress, VehicleInspection, Estimate, CustomerIssue
from accounts.models import User

from django.db import transaction
from core.utils import safe_group_send

def broadcast_dashboard_update(instance, update_type, message):
    groups = ['admin_updates']
    
    branch = getattr(instance, 'branch', None)
    if not branch and hasattr(instance, 'vehicle') and instance.vehicle:
        pass
        
    if branch:
        groups.append(f'branch_updates_{branch.id}')
        if branch.organization_id:
            groups.append(f'org_updates_{branch.organization_id}')
    
    for group in groups:
        safe_group_send(group, {
            'type': 'send_update',
            'update_type': update_type,
            'message': message
        })

# Store old status/role for tracking
_old_status_cache = {}
_old_role_cache = {}

@receiver(pre_save, sender=ServiceOrder)
def cache_old_service_order_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_obj = ServiceOrder.objects.get(pk=instance.pk)
            _old_status_cache[instance.pk] = old_obj.status
        except ServiceOrder.DoesNotExist:
            pass

@receiver(pre_save, sender=User)
def cache_old_user_role(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_obj = User.objects.get(pk=instance.pk)
            _old_role_cache[instance.pk] = old_obj.role
        except User.DoesNotExist:
            pass

@receiver(post_save, sender=User)
def audit_user_role_change(sender, instance, created, **kwargs):
    if not created and instance.pk in _old_role_cache:
        old_role = _old_role_cache.pop(instance.pk)
        if old_role != instance.role:
            # Role changed - Log to AuditLog
            AuditLog.objects.create(
                action=f"User Role Changed: {instance.email}",
                old_value=old_role,
                new_value=instance.role
            )
            # Create a system notification for the user
            SystemNotification.objects.create(
                user=instance,
                notification_type='SYSTEM',
                title='Role Updated',
                message=f'Your role has been updated from {old_role} to {instance.role}.'
            )

@receiver(post_save, sender=User)
def notify_customer_registration(sender, instance, created, **kwargs):
    if created and instance.role == 'CUSTOMER':
        broadcast_dashboard_update(
            instance, 
            'CUSTOMER_REGISTERED', 
            f"New customer registered: {instance.first_name} {instance.last_name} ({instance.email})"
        )

@receiver(post_save, sender=Vehicle)
def notify_vehicle_registration(sender, instance, created, **kwargs):
    if created:
        broadcast_dashboard_update(
            instance,
            'VEHICLE_REGISTERED',
            f"New vehicle added: {instance.make} {instance.model} ({instance.registration_number})"
        )

@receiver(post_save, sender=Appointment)
def handle_appointment_creation(sender, instance, created, **kwargs):
    if created:
        broadcast_dashboard_update(
            instance,
            'APPOINTMENT_BOOKED',
            f"New service booked for {instance.vehicle.make} {instance.vehicle.model}"
        )
        
        if hasattr(instance, 'customer') and instance.customer:
            safe_group_send(
                f'customer_updates_{instance.customer.id}',
                {
                    'type': 'send_update',
                    'update_type': 'SERVICE_HISTORY_UPDATED',
                    'message': f"Your appointment for {instance.vehicle.make} has been booked."
                }
            )
        
        # Auto-create ServiceOrder and route to appropriate branch
        order_number = f"SO-{instance.id.hex[:6].upper()}"
        ServiceOrder.objects.create(
            vehicle=instance.vehicle,
            order_number=order_number,
            title=f"Service for {instance.vehicle.registration_number}",
            type=instance.service_type,
            status='PENDING',
            branch=instance.branch,
            advisor=instance.advisor.username if instance.advisor else None
        )

@receiver(post_save, sender=ServiceOrder)
def notify_service_order_change(sender, instance, created, **kwargs):
    action = "created" if created else "updated"

    if not created and instance.pk in _old_status_cache:
        old_status = _old_status_cache.pop(instance.pk)
        if old_status != instance.status:
            AuditLog.objects.create(
                action=f"Service Order Status Changed: {instance.order_number}",
                service_order=instance,
                old_value=old_status,
                new_value=instance.status
            )
            
            # Auto-generate Invoice when completed/ready
            if instance.status in ['READY_FOR_PICKUP', 'COMPLETED']:
                from .models import Invoice
                import uuid
                if not Invoice.objects.filter(service_order=instance).exists():
                    amount = getattr(instance, 'total_cost', 0)
                    if hasattr(instance, 'service_estimate') and instance.service_estimate:
                        amount = instance.service_estimate.total
                        
                    Invoice.objects.create(
                        branch=instance.branch,
                        invoice_number=f"INV-{str(uuid.uuid4())[:8].upper()}",
                        customer=instance.vehicle.owner,
                        vehicle=instance.vehicle,
                        service_order=instance,
                        amount=amount,
                        status='UNPAID'
                    )
            

    # Notify dashboard (admin, branch manager, etc)
    broadcast_dashboard_update(
        instance,
        f'SERVICE_ORDER_{action.upper()}',
        f"Service Order {instance.order_number} was {action}. Status: {instance.status}"
    )
    
    # Notify technicians
    if instance.technician:
        try:
            tech = User.objects.get(username=instance.technician)
            safe_group_send(
                f'technician_updates_{tech.id}',
                {
                    'type': 'send_update',
                    'update_type': f'SERVICE_ORDER_{action.upper()}',
                    'message': f"Job {instance.order_number} {action}."
                }
            )
        except User.DoesNotExist:
            pass

    # Notify customer to update service history
    if instance.vehicle and instance.vehicle.owner:
        customer_id = str(instance.vehicle.owner.id)
        safe_group_send(
            f'customer_updates_{customer_id}',
            {
                'type': 'send_update',
                'update_type': 'SERVICE_HISTORY_UPDATED',
                'message': f"Your Service Request '{instance.title}' was {action}. Status: {instance.status}",
            }
        )

@receiver(post_save, sender=VehicleDamage)
def notify_vehicle_damage(sender, instance, created, **kwargs):
    if not created:
        return

    branch = getattr(instance.vehicle.service_orders.first(), 'branch', None)
    group = f'branch_updates_{branch.id}' if branch else 'admin_updates'
        
    safe_group_send(
        group,
        {
            'type': 'send_update',
            'update_type': 'DAMAGE_ADDED',
            'message': f"New damage logged on {instance.vehicle.registration_number}: {instance.damage_type}"
        }
    )

import secrets
from .models import Vehicle, VehicleQRCode

@receiver(post_save, sender=Vehicle)
def ensure_vehicle_qr_code(sender, instance, created, **kwargs):
    if created:
        token = secrets.token_urlsafe(32)
        VehicleQRCode.objects.create(vehicle=instance, token=token)

from .models import Invoice

@receiver(post_save, sender=Invoice)
def notify_invoice_change(sender, instance, created, **kwargs):
    action = "generated" if created else "updated"
    
    # Notify customer
    if instance.customer:
        customer_id = str(instance.customer.id)
        safe_group_send(
            f'customer_updates_{customer_id}',
            {
                'type': 'send_update',
                'update_type': 'SERVICE_HISTORY_UPDATED',
                'message': f"Invoice {instance.invoice_number} was {action}. Status: {instance.status}. Amount: ?{instance.amount}",
            }
        )

@receiver(post_save, sender=TechnicianAssignment)
def notify_technician_assignment(sender, instance, created, **kwargs):
    if created and instance.is_active:
        service_order = instance.service_order
        vehicle = service_order.vehicle
        customer = vehicle.owner
        message = (
            f"Assigned to {service_order.order_number}. "
            f"Vehicle: {vehicle.make} {vehicle.model} ({vehicle.registration_number}). "
            f"Customer: {customer.get_full_name() if customer else 'Unknown'}. "
            f"Type: {service_order.type}."
        )
        
        TechnicianNotification.objects.create(
            recipient=instance.technician,
            event_type='ASSIGNMENT',
            message=message,
            service_order=service_order
        )
        safe_group_send(
            f'technician_updates_{instance.technician.id}',
            {
                'type': 'send_update',
                'update_type': 'TECHNICIAN_ASSIGNED',
                'message': message
            }
        )
        broadcast_dashboard_update(service_order, 'SERVICE_ORDER_UPDATED', f"Technician {instance.technician.username} assigned to {service_order.order_number}")
        if customer:
            safe_group_send(
                f'customer_updates_{customer.id}',
                {
                    'type': 'send_update',
                    'update_type': 'SERVICE_HISTORY_UPDATED',
                    'message': f"A technician has been assigned to your vehicle."
                }
            )

@receiver(post_save, sender=RepairTask)
def notify_repair_task_update(sender, instance, created, **kwargs):
    service_order = instance.service_order
    vehicle = service_order.vehicle
    customer = vehicle.owner
    
    action = "added" if created else f"updated to {instance.status}"
    broadcast_dashboard_update(service_order, 'SERVICE_ORDER_UPDATED', f"Task '{instance.name}' {action} for {service_order.order_number}")
    if customer and instance.status == 'COMPLETED':
        safe_group_send(
            f'customer_updates_{customer.id}',
            {
                'type': 'send_update',
                'update_type': 'SERVICE_HISTORY_UPDATED',
                'message': f"Task '{instance.name}' has been completed on your vehicle."
            }
        )

@receiver(post_save, sender=RepairProgress)
def notify_repair_progress(sender, instance, created, **kwargs):
    if created:
        service_order = instance.task.service_order
        customer = service_order.vehicle.owner
        broadcast_dashboard_update(service_order, 'SERVICE_ORDER_UPDATED', f"Progress update on {service_order.order_number}: {instance.percentage}%")
        if customer:
            safe_group_send(
                f'customer_updates_{customer.id}',
                {
                    'type': 'send_update',
                    'update_type': 'SERVICE_HISTORY_UPDATED',
                    'message': f"Repair progress update: {instance.percentage}% complete."
                }
            )

@receiver(post_save, sender=VehicleInspection)
@receiver(post_save, sender=Estimate)
@receiver(post_save, sender=CustomerIssue)
def notify_generic_service_history(sender, instance, created, **kwargs):
    service_order = getattr(instance, 'service_order', None)
    if not service_order:
        return
        
    vehicle = getattr(service_order, 'vehicle', None)
    customer = getattr(vehicle, 'owner', None)
    
    model_name = sender.__name__
    action = "added" if created else "updated"
    
    broadcast_dashboard_update(service_order, 'SERVICE_ORDER_UPDATED', f"{model_name} {action} for {service_order.order_number}")
    if customer:
        safe_group_send(
            f'customer_updates_{customer.id}',
            {
                'type': 'send_update',
                'update_type': 'SERVICE_HISTORY_UPDATED',
                'message': f"New {model_name} update on your service order."
            }
        )

from .models import EstimateItem
from django.db.models import Sum

@receiver(post_save, sender=EstimateItem)
@receiver(post_delete, sender=EstimateItem)
def update_estimate_totals(sender, instance, **kwargs):
    estimate = instance.estimate
    # Ensure totals are calculated on server side
    items_total = estimate.items.aggregate(Sum('total_price'))['total_price__sum'] or 0
    estimate.subtotal = items_total
    
    # Recalculate tax (e.g. 10%) and total
    # Adjust according to business rules if tax is different.
    # Assuming frontend might pass tax or discount, but we should enforce server calculation
    # If no tax rate is defined, we leave it as 0 or 10%? Let's keep existing tax/discount but ensure total = subtotal + tax - discount
    # Let's say tax is computed as 10% for this example if it wasn't explicitly set, 
    # but the safest is just to do: total = subtotal + tax - discount
    estimate.total = estimate.subtotal + estimate.tax - estimate.discount
    
    # Disconnect signals to prevent infinite loop if we were to trigger save (though we are saving Estimate, not EstimateItem)
    estimate.save(update_fields=['subtotal', 'total'])

