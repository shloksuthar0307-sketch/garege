from rest_framework import viewsets, permissions
from accounts.permissions import IsOrgAdmin, IsSuperAdmin
from .models import Organization, Branch
from .serializers import OrganizationSerializer, BranchSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    queryset = Organization.objects.all()

class BranchViewSet(viewsets.ModelViewSet):
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'SUPER_ADMIN':
            return Branch.objects.all()
        if hasattr(user, 'role') and user.role == 'ORG_ADMIN' and user.organization:
            return Branch.objects.filter(organization=user.organization)
        return Branch.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'ORG_ADMIN':
            serializer.save(organization=user.organization)
        else:
            serializer.save()
