from rest_framework import permissions
from accounts.models import Role

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.SUPER_ADMIN)

class IsOrgAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [Role.SUPER_ADMIN, Role.ORG_ADMIN])

class IsBranchManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.BRANCH_MANAGER])

class IsServiceAdvisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.BRANCH_MANAGER, Role.SERVICE_ADVISOR])

class IsTechnician(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.BRANCH_MANAGER, Role.TECHNICIAN])

class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.CUSTOMER)
