from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from organizations.models import Organization, Branch
from core.models import Vehicle, ServiceOrder, Estimate, Invoice
from unittest.mock import patch
import uuid

User = get_user_model()

class SecurityBoundaryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Org 1
        self.org1 = Organization.objects.create(name="Org 1")
        self.branch1 = Branch.objects.create(organization=self.org1, name="Branch 1")
        
        # Org 2
        self.org2 = Organization.objects.create(name="Org 2")
        self.branch2 = Branch.objects.create(organization=self.org2, name="Branch 2")
        
        # Users for Org 1
        self.manager1 = User.objects.create_user(username="manager1", email="manager1@test.com", password="password", role="BRANCH_MANAGER", branch=self.branch1, organization=self.org1)
        
        # Users for Org 2
        self.manager2 = User.objects.create_user(username="manager2", email="manager2@test.com", password="password", role="BRANCH_MANAGER", branch=self.branch2, organization=self.org2)
        
        # Customer
        self.customer = User.objects.create_user(username="customer1", email="customer1@test.com", password="password", role="CUSTOMER")
        
        # Vehicle and Service Order in Branch 1
        self.vehicle1 = Vehicle.objects.create(owner=self.customer, make="Toyota", model="Camry", year=2020)
        self.so1 = ServiceOrder.objects.create(vehicle=self.vehicle1, branch=self.branch1, order_number="SO-001")
        
        # Estimate in Branch 1
        self.estimate1 = Estimate.objects.create(service_order=self.so1, total=100.00, status="SENT")
        
        # Invoice in Branch 1
        self.invoice1 = Invoice.objects.create(customer=self.customer, vehicle=self.vehicle1, service_order=self.so1, amount=100.00, status="UNPAID", invoice_number="INV-001", branch=self.branch1)

    def test_branch_manager_cannot_access_other_branch_orders(self):
        self.client.force_authenticate(user=self.manager2)
        response = self.client.get('/api/v1/manager/service-orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should be empty since SO1 is in Branch 1
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(data), 0)
        
        # Try direct access
        response = self.client.get(f'/api/v1/manager/service-orders/{self.so1.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_estimate_approval(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(f'/api/v1/advisor/estimates/{self.estimate1.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.estimate1.refresh_from_db()
        self.assertEqual(self.estimate1.status, "APPROVED")
        self.assertEqual(self.estimate1.approved_by, self.customer)
        self.assertIsNotNone(self.estimate1.approved_date)

    from django.test import override_settings

    @patch('razorpay.Client')
    @override_settings(RAZORPAY_KEY_ID='test_id', RAZORPAY_KEY_SECRET='test_secret')
    def test_verify_payment_success(self, MockRazorpayClient):
        # Mock Razorpay Utility
        mock_client_instance = MockRazorpayClient.return_value
        mock_client_instance.utility.verify_payment_signature.return_value = True
        
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(f'/api/v1/invoices/{self.invoice1.id}/verify-payment/', {
            'payment_id': 'pay_12345',
            'order_id': 'order_12345',
            'signature': 'valid_signature'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.invoice1.refresh_from_db()
        self.assertEqual(self.invoice1.status, "PAID")

    @patch('razorpay.Client')
    @override_settings(RAZORPAY_KEY_ID='test_id', RAZORPAY_KEY_SECRET='test_secret')
    def test_verify_payment_invalid_signature(self, MockRazorpayClient):
        # Mock Razorpay Utility throwing Exception for invalid signature
        mock_client_instance = MockRazorpayClient.return_value
        mock_client_instance.utility.verify_payment_signature.side_effect = Exception("Invalid signature")
        
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(f'/api/v1/invoices/{self.invoice1.id}/verify-payment/', {
            'payment_id': 'pay_12345',
            'order_id': 'order_12345',
            'signature': 'invalid_signature'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.invoice1.refresh_from_db()
        self.assertEqual(self.invoice1.status, "UNPAID")
