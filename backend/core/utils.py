from accounts.models import Role

def get_scoped_queryset(qs, user, branch_lookup='branch', customer_lookup=None):
    """
    Given a queryset, applies role-based filtering.
    - Super Admins see everything.
    - Org Admins see everything in their organization.
    - Branch Managers, Service Advisors, Technicians see everything in their assigned branch.
    - Customers see everything they own (requires customer_lookup if different).
    """
    if user.role == Role.SUPER_ADMIN:
        return qs
    elif user.role == Role.ORG_ADMIN and user.organization:
        org_lookup = f"{branch_lookup}__organization"
        return qs.filter(**{org_lookup: user.organization})
    elif user.role in [Role.BRANCH_MANAGER, Role.SERVICE_ADVISOR, Role.TECHNICIAN, Role.INVENTORY_MANAGER] and user.branch:
        return qs.filter(**{branch_lookup: user.branch})
    elif user.role == Role.CUSTOMER and customer_lookup:
        return qs.filter(**{customer_lookup: user})
    return qs.none()

from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def safe_group_send(group_name, payload):
    def send():
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(group_name, payload)
        except Exception as e:
            import logging
            logging.getLogger('django.request').error(f"WebSocket broadcast failed: {e}")
    transaction.on_commit(send)

def validate_file_upload(file_obj, max_size_mb=5, allowed_extensions=None, allowed_mimetypes=None):
    if not allowed_extensions:
        allowed_extensions = ['.pdf', '.png', '.jpg', '.jpeg', '.mp4']
    if not allowed_mimetypes:
        allowed_mimetypes = ['application/pdf', 'image/png', 'image/jpeg', 'video/mp4']

    # Check size
    if file_obj.size > max_size_mb * 1024 * 1024:
        raise ValueError(f"File size exceeds maximum limit of {max_size_mb}MB.")

    # Check extension
    import os
    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext not in allowed_extensions:
        raise ValueError(f"File extension {ext} is not allowed.")

    # Check mimetype
    if file_obj.content_type not in allowed_mimetypes:
        raise ValueError(f"File type {file_obj.content_type} is not allowed.")

    # Basic content check (magic numbers) for typical types
    file_obj.seek(0)
    head = file_obj.read(1024)
    file_obj.seek(0)
    
    # If it's supposed to be an image/pdf but looks like html/script
    if b'<html' in head.lower() or b'<script' in head.lower():
        raise ValueError("File content is not allowed (HTML/Script detected).")
        
    return True
