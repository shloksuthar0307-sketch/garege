from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid

class Role(models.TextChoices):
    SUPER_ADMIN = 'SUPER_ADMIN', _('Super Admin')
    ORG_ADMIN = 'ORG_ADMIN', _('Organization Admin')
    BRANCH_MANAGER = 'BRANCH_MANAGER', _('Branch Manager')
    SERVICE_ADVISOR = 'SERVICE_ADVISOR', _('Service Advisor')
    TECHNICIAN = 'TECHNICIAN', _('Technician')
    INVENTORY_MANAGER = 'INVENTORY_MANAGER', _('Inventory Manager')
    CUSTOMER = 'CUSTOMER', _('Customer')


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=50,
        choices=Role.choices,
        default=Role.CUSTOMER
    )
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    
    # We will link users to organizations and branches later.
    # We can use nullable foreign keys directly here or a separate profile model.
    # Given the multi-tenant architecture, a user typically belongs to an organization.
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    branch = models.ForeignKey(
        'organizations.Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
