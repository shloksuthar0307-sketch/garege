from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_manager import (
    manager_dashboard_kpis,
    manager_alerts,
    ManagerServiceOrderViewSet,
    ManagerAppointmentViewSet,
    ManagerCustomerIssueViewSet,
    ManagerCustomerViewSet,
    ManagerInvoiceViewSet,
    ManagerTechnicianViewSet,
    ManagerInventoryViewSet
)

router = DefaultRouter()
router.register(r'service-orders', ManagerServiceOrderViewSet, basename='manager-service-orders')
router.register(r'appointments', ManagerAppointmentViewSet, basename='manager-appointments')
router.register(r'customer-issues', ManagerCustomerIssueViewSet, basename='manager-customer-issues')
router.register(r'customers', ManagerCustomerViewSet, basename='manager-customers')
router.register(r'invoices', ManagerInvoiceViewSet, basename='manager-invoices')
router.register(r'technicians', ManagerTechnicianViewSet, basename='manager-technicians')
router.register(r'inventory', ManagerInventoryViewSet, basename='manager-inventory')

urlpatterns = [
    path('dashboard/kpis/', manager_dashboard_kpis, name='manager-kpis'),
    path('dashboard/alerts/', manager_alerts, name='manager-alerts'),
    path('', include(router.urls)),
]
