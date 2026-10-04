from rest_framework import serializers
from .models import Organization, Branch

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class BranchSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    class Meta:
        model = Branch
        fields = '__all__'
