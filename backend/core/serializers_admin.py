from rest_framework import serializers
from accounts.models import User
from core.models import ServiceOrder, Vehicle

class AdminUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    mfa = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'role', 'role_display', 'status', 'last_login', 'mfa', 'avatar']

    def get_name(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.username

    def get_mfa(self, obj):
        # Placeholder for MFA
        return False
        
    def get_status(self, obj):
        return 'Active' if obj.is_active else 'Suspended'
        
    def get_avatar(self, obj):
        name = self.get_name(obj).replace(" ", "+")
        return f"https://ui-avatars.com/api/?name={name}&background=35D07F&color=000"
        
    def get_role_display(self, obj):
        return obj.get_role_display()
