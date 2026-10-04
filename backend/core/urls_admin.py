from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_admin import AdminUserViewSet, AdminAnalyticsViewSet

from organizations.views import BranchViewSet, OrganizationViewSet

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-user')
router.register(r'analytics', AdminAnalyticsViewSet, basename='admin-analytics')
router.register(r'branches', BranchViewSet, basename='admin-branches')
router.register(r'organizations', OrganizationViewSet, basename='admin-organizations')

urlpatterns = [
    path('', include(router.urls)),
]
