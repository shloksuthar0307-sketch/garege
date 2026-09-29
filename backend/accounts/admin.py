from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'organization', 'branch', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Role and Tenant', {'fields': ('role', 'organization', 'branch')}),
    )

admin.site.register(User, CustomUserAdmin)
