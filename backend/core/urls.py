from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehicleViewSet, ServiceOrderViewSet, AdminVehicleViewSet,
    CustomerProfileViewSet, SupportTicketViewSet, UserCustomerViewSet, SupportMessageViewSet,
    InvoiceViewSet, SubscriptionPlanViewSet, CustomerSubscriptionViewSet,
    NotificationPreferenceViewSet, PaymentMethodViewSet, AppointmentViewSet
)

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'admin-vehicles', AdminVehicleViewSet, basename='admin-vehicle')
router.register(r'service-orders', ServiceOrderViewSet, basename='serviceorder')
router.register(r'customer-profiles', CustomerProfileViewSet, basename='customerprofile')
router.register(r'customers', UserCustomerViewSet, basename='customer')
router.register(r'support-tickets', SupportTicketViewSet, basename='supportticket')
router.register(r'support-messages', SupportMessageViewSet, basename='supportmessage')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'subscription-plans', SubscriptionPlanViewSet, basename='subscriptionplan')
router.register(r'customer-subscriptions', CustomerSubscriptionViewSet, basename='customersubscription')
router.register(r'notification-preferences', NotificationPreferenceViewSet, basename='notificationpreference')
router.register(r'payment-methods', PaymentMethodViewSet, basename='paymentmethod')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
]
from .views import get_vehicle_qr, regenerate_vehicle_qr, revoke_vehicle_qr, public_vehicle_history
urlpatterns += [
    path('vehicles/<uuid:pk>/qr/', get_vehicle_qr, name='vehicle-qr'),
    path('vehicles/<uuid:pk>/qr/regenerate/', regenerate_vehicle_qr, name='vehicle-qr-regenerate'),
    path('vehicles/<uuid:pk>/qr/revoke/', revoke_vehicle_qr, name='vehicle-qr-revoke'),
    path('vehicle-history/<str:token>/', public_vehicle_history, name='public-vehicle-history'),
]
from .views import admin_dashboard_kpis, technician_dashboard_stats, technician_work_orders
urlpatterns += [
    path('admin-dashboard/kpis/', admin_dashboard_kpis, name='admin-dashboard-kpis'),
    path('technician/dashboard/', technician_dashboard_stats, name='technician-dashboard-stats'),
    path('technician/work-orders/', technician_work_orders, name='technician-work-orders'),
]
