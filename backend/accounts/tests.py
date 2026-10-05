from rest_framework.test import APITestCase
from django.urls import reverse
from accounts.models import User, Role

class AuthTests(APITestCase):
    def test_register_customer(self):
        data = {
            'email': 'newcustomer@test.com',
            'password': 'password123',
            'first_name': 'John',
            'last_name': 'Doe',
            'phone': '1234567890'
        }
        response = self.client.post('/api/v1/auth/register/', data)
        self.assertEqual(response.status_code, 201)
        self.assertIn('access', response.data)
        
    def test_login_customer(self):
        User.objects.create_user(
            username='existing',
            email='existing@test.com',
            password='password123',
            role=Role.CUSTOMER
        )
        data = {
            'username': 'existing',
            'password': 'password123'
        }
        response = self.client.post('/api/v1/auth/token/', data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
