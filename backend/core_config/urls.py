from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import CustomTokenObtainPairView, CustomerRegisterView
from core.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Health
    path('api/v1/health/', health_check, name='health_check'),
    
    # Core Endpoints
    path('api/v1/manager/', include('core.urls_manager')),
    path('api/v1/inventory-manager/', include('core.urls_inventory')),
    path('api/v1/advisor/', include('core.urls_advisor')),
    path('api/v1/technician/', include('core.urls_technician')),
    path('api/v1/customer/', include('core.urls_customer')),
    path('api/v1/', include('core.urls')),
    
    # Auth Endpoints
    path('api/v1/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/register/', CustomerRegisterView.as_view(), name='auth_register'),
]
