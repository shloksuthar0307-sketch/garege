from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['user'] = {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
        }
        
        if user.organization:
            token['user']['organization_id'] = str(user.organization.id)
            token['user']['organization_name'] = user.organization.name

        if user.branch:
            token['user']['branch_id'] = str(user.branch.id)
            token['user']['branch_name'] = user.branch.name

        return token

    def validate(self, attrs):
        # Explicit validation for missing fields
        username = attrs.get('username')
        password = attrs.get('password')
        
        if not username or not password:
            raise exceptions.ValidationError(
                {"detail": _("Both username and password are required.")}
            )

        # Catch default AuthenticationFailed to provide a more user-friendly message
        try:
            data = super().validate(attrs)
        except exceptions.AuthenticationFailed:
            raise exceptions.AuthenticationFailed(
                {"detail": _("Invalid username or password. Please try again.")},
                code='invalid_credentials'
            )

        # Custom Validation Logic
        if not self.user.is_active:
            raise exceptions.AuthenticationFailed(
                {"detail": _("User account is disabled. Please contact support.")},
                code='user_inactive',
            )

        return data
from rest_framework import serializers
from core.models import CustomerProfile, AuditLog, SystemNotification
from organizations.models import Branch, Organization

class CustomerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    branch_id = serializers.UUIDField(required=False, write_only=True, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'confirm_password', 'email', 'first_name', 'last_name', 'phone_number', 'branch_id']

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        # Password match validation
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # Phone number basic validation (just an example, customize as needed)
        phone = data.get('phone_number')
        if phone and not phone.isdigit():
            raise serializers.ValidationError({"phone_number": "Phone number must contain only digits."})
        if phone and len(phone) < 10:
            raise serializers.ValidationError({"phone_number": "Phone number must be at least 10 digits."})

        return data

    def create(self, validated_data):
        # Remove confirm_password as it's not a model field
        validated_data.pop('confirm_password', None)
        branch_id = validated_data.pop('branch_id', None)
        
        org = None
        branch = None
        if branch_id:
            try:
                branch = Branch.objects.get(id=branch_id)
                org = branch.organization
            except Branch.DoesNotExist:
                raise serializers.ValidationError({"branch_id": "Invalid branch selected."})

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number', ''),
            role='CUSTOMER',
            organization=org,
            branch=branch
        )
        CustomerProfile.objects.create(user=user)
        
        # Create audit log
        AuditLog.objects.create(
            actor=user,
            action="Customer Registration",
            new_value=f"Registered as {user.username}"
        )
        
        # Create notification for the user
        SystemNotification.objects.create(
            user=user,
            notification_type="SYSTEM",
            title="Welcome to RepairTrace!",
            message="Your account has been successfully created. You can now add your vehicles and book service appointments."
        )
        
        return user
