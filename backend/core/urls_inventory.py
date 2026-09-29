from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_inventory import (
    InventoryDashboardAPI,
    InventoryPartViewSet,
    StockReservationViewSet,
    StockMovementViewSet,
    RequiredPartViewSet,
    SupplierViewSet,
    PurchaseRequestViewSet,
)

router = DefaultRouter()
router.register(r'parts', InventoryPartViewSet, basename='inventory-parts')
router.register(r'reservations', StockReservationViewSet, basename='inventory-reservations')
router.register(r'movements', StockMovementViewSet, basename='inventory-movements')
router.register(r'required-parts', RequiredPartViewSet, basename='inventory-required-parts')
router.register(r'suppliers', SupplierViewSet, basename='inventory-suppliers')
router.register(r'purchase-requests', PurchaseRequestViewSet, basename='inventory-purchase-requests')

urlpatterns = [
    path('dashboard/', InventoryDashboardAPI.as_view(), name='inventory-dashboard'),
    path('', include(router.urls)),
]
