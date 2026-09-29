from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_advisor import (
    advisor_dashboard_stats,
    AdvisorServiceOrderViewSet,
    AdvisorAppointmentViewSet,
    EstimateViewSet,
    CustomerCommunicationViewSet,
    FollowUpTaskViewSet,
    VehicleDamageViewSet,
    TechnicianViewSet,
    ConversationViewSet,
    MessageViewSet,
    CustomerViewSet,
    SystemNotificationViewSet,
    AdvisorVehicleViewSet
)

router = DefaultRouter()
router.register(r'service-orders', AdvisorServiceOrderViewSet, basename='advisor-service-orders')
router.register(r'appointments', AdvisorAppointmentViewSet, basename='advisor-appointments')
router.register(r'estimates', EstimateViewSet, basename='advisor-estimates')
router.register(r'communications', CustomerCommunicationViewSet, basename='advisor-communications')
router.register(r'follow-ups', FollowUpTaskViewSet, basename='advisor-follow-ups')
router.register(r'damages', VehicleDamageViewSet, basename='advisor-damages')
router.register(r'technicians', TechnicianViewSet, basename='advisor-technicians')
router.register(r'conversations', ConversationViewSet, basename='advisor-conversations')
router.register(r'messages', MessageViewSet, basename='advisor-messages')
router.register(r'customers', CustomerViewSet, basename='advisor-customers')
router.register(r'notifications', SystemNotificationViewSet, basename='advisor-notifications')
router.register(r'vehicles', AdvisorVehicleViewSet, basename='advisor-vehicles')

urlpatterns = [
    path('dashboard/', advisor_dashboard_stats, name='advisor-dashboard-stats'),
    path('', include(router.urls)),
]
