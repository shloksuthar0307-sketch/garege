from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import CustomTokenObtainPairView, CustomerRegisterView, BranchListView
from core.views import health_check

urlpatterns = [
    path('', lambda r: HttpResponseRedirect('/api/v1/health/')),
    path('admin/', admin.site.urls),
    
    # API Health
    path('api/v1/health/', health_check, name='health_check'),
    
    # Core Endpoints
    path('api/v1/manager/', include('core.urls_manager')),
    path('api/v1/inventory-manager/', include('core.urls_inventory')),
    path('api/v1/advisor/', include('core.urls_advisor')),
    path('api/v1/technician/', include('core.urls_technician')),
    path('api/v1/customer/', include('core.urls_customer')),
    path('api/v1/admin/', include('core.urls_admin')),
    path('api/v1/', include('core.urls')),
    
    # Auth Endpoints
    path('api/v1/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/register/', CustomerRegisterView.as_view(), name='auth_register'),
    path('api/v1/auth/branches/', BranchListView.as_view(), name='auth_branches'),
]

from django.conf import settings
from django.conf.urls.static import static
from core.views import secure_media_serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', secure_media_serve, name='secure_media'),
]

if settings.DEBUG:
    # Just in case, though the re_path above should catch it.
    pass
