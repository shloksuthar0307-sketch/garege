from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import ServiceOrder, VehicleDamage

@receiver(post_save, sender=ServiceOrder)
def notify_service_order_change(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
        
    action = "created" if created else "updated"
    
    # Notify advisors
    async_to_sync(channel_layer.group_send)(
        'advisor_updates',
        {
            'type': 'send_update',
            'update_type': f'SERVICE_ORDER_{action.upper()}',
            'message': f"Service Order {instance.order_number} was {action}. Status: {instance.status}"
        }
    )
    
    # Notify technicians
    if instance.technician:
        async_to_sync(channel_layer.group_send)(
            'technician_updates',
            {
                'type': 'send_update',
                'update_type': f'SERVICE_ORDER_{action.upper()}',
                'message': f"Job {instance.order_number} {action}."
            }
        )

@receiver(post_save, sender=VehicleDamage)
def notify_vehicle_damage(sender, instance, created, **kwargs):
    if not created:
        return
        
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
        
    async_to_sync(channel_layer.group_send)(
        'advisor_updates',
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
