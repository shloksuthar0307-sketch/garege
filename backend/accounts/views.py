from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT Login View that includes user details in the response
    and performs custom validation (checking active status).
    """
    serializer_class = CustomTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import CustomerRegistrationSerializer, CustomTokenObtainPairSerializer
from organizations.models import Branch

class BranchListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        branches = Branch.objects.select_related('organization').all()
        data = [{'id': str(b.id), 'name': b.name, 'organization_name': b.organization.name} for b in branches]
        return Response(data)

class CustomerRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT token
            token_serializer = CustomTokenObtainPairSerializer()
            token = token_serializer.get_token(user)
            
            return Response({
                "message": "User registered successfully.",
                "access": str(token.access_token),
                "refresh": str(token),
                "user": {
                    "id": str(user.id),
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
