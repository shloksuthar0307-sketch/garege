from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from accounts.models import User, Role
from core.models import Vehicle, ServiceOrder
from organizations.models import Organization, Branch
import uuid

class RBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Setup Models
        self.org1 = Organization.objects.create(name="Org 1")
        self.branch1 = Branch.objects.create(name="Branch 1", organization=self.org1)
        self.branch2 = Branch.objects.create(name="Branch 2", organization=self.org1)
        
        self.org2 = Organization.objects.create(name="Org 2")
        self.branch3 = Branch.objects.create(name="Branch 3", organization=self.org2)

        # Users
        self.super_admin = User.objects.create_user(username="super", email="super@example.com", password="password", role=Role.SUPER_ADMIN)
        self.org_admin = User.objects.create_user(username="org", email="org@example.com", password="password", role=Role.ORG_ADMIN, organization=self.org1)
        self.branch_mgr = User.objects.create_user(username="mgr", email="mgr@example.com", password="password", role=Role.BRANCH_MANAGER, branch=self.branch1)
        self.advisor = User.objects.create_user(username="adv", email="adv@example.com", password="password", role=Role.SERVICE_ADVISOR, branch=self.branch1)
        self.tech = User.objects.create_user(username="tech", email="tech@example.com", password="password", role=Role.TECHNICIAN, branch=self.branch2)
        
        self.customer1 = User.objects.create_user(username="cust1", email="cust1@example.com", password="password", role=Role.CUSTOMER, branch=self.branch1)
        self.customer2 = User.objects.create_user(username="cust2", email="cust2@example.com", password="password", role=Role.CUSTOMER, branch=self.branch3)

        # Data
        self.vehicle1 = Vehicle.objects.create(make="Toyota", model="Camry", year=2020, registration_number="ABC-123", vin="123456789", owner=self.customer1)
        self.vehicle2 = Vehicle.objects.create(make="Honda", model="Civic", year=2021, registration_number="XYZ-987", vin="987654321", owner=self.customer2)
        
        self.so1 = ServiceOrder.objects.create(vehicle=self.vehicle1, order_number="SO-001", title="Oil Change", branch=self.branch1)
        self.so2 = ServiceOrder.objects.create(vehicle=self.vehicle1, order_number="SO-002", title="Tire Rotation", branch=self.branch2)
        self.so3 = ServiceOrder.objects.create(vehicle=self.vehicle2, order_number="SO-003", title="Brake Inspection", branch=self.branch3)

    def test_super_admin_access(self):
        self.client.force_authenticate(user=self.super_admin)
        
        # Super admin should see all service orders in advisor endpoint
        # The advisor endpoint relies on IsServiceAdvisor and get_scoped_queryset
        response = self.client.get('/api/v1/advisor/service-orders/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 3)

    def test_org_admin_access(self):
        self.client.force_authenticate(user=self.org_admin)
        
        # Org admin should see all service orders in org 1 (branch 1 and 2), which is so1 and so2. Length = 2.
        response = self.client.get('/api/v1/advisor/service-orders/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 2)

    def test_branch_manager_access(self):
        self.client.force_authenticate(user=self.branch_mgr)
        
        # Branch manager 1 should see only so1
        response = self.client.get('/api/v1/advisor/service-orders/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['order_number'], "SO-001")

    def test_customer_denied_advisor_endpoint(self):
        self.client.force_authenticate(user=self.customer1)
        
        # Customer hitting advisor endpoint should get 403
        response = self.client.get('/api/v1/advisor/service-orders/')
        self.assertEqual(response.status_code, 403)

    def test_customer_access_own_endpoint(self):
        self.client.force_authenticate(user=self.customer1)
        
        # Customer hitting customer endpoint should see their own orders (so1, so2)
        response = self.client.get('/api/v1/customer/service-orders/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 2)
