from django.test import TestCase, Client
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from accounts.models import User, Role
from core.models import Vehicle, VehicleDocument
import os
from django.conf import settings

class SecureMediaServeTests(TestCase):
    def setUp(self):
        self.client = Client()
        
        self.owner = User.objects.create_user(
            username='owner',
            email='owner@test.com',
            password='password123',
            role=Role.CUSTOMER
        )
        self.other_customer = User.objects.create_user(
            username='other',
            email='other@test.com',
            password='password123',
            role=Role.CUSTOMER
        )
        
        self.vehicle = Vehicle.objects.create(
            owner=self.owner,
            make='Toyota',
            model='Camry',
            year=2020
        )
        
        # Create a dummy file
        self.test_file_content = b'test file content'
        self.test_file = SimpleUploadedFile("test_doc.txt", self.test_file_content, content_type="text/plain")
        
        self.document = VehicleDocument.objects.create(
            vehicle=self.vehicle,
            title='Test Doc',
            file=self.test_file
        )
        
        self.file_path = self.document.file.name

    def get_jwt_token(self, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return f'Bearer {refresh.access_token}'

    def test_anonymous_user_rejected(self):
        response = self.client.get(f'/media/{self.file_path}')
        self.assertEqual(response.status_code, 401)

    def test_other_customer_rejected(self):
        response = self.client.get(f'/media/{self.file_path}', HTTP_AUTHORIZATION=self.get_jwt_token(self.other_customer))
        self.assertEqual(response.status_code, 404)

    def test_owner_can_access(self):
        response = self.client.get(f'/media/{self.file_path}', HTTP_AUTHORIZATION=self.get_jwt_token(self.owner))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(list(response.streaming_content)[0], self.test_file_content)

    def test_path_traversal_rejected(self):
        response = self.client.get('/media/../manage.py', HTTP_AUTHORIZATION=self.get_jwt_token(self.owner))
        self.assertEqual(response.status_code, 404)

    def tearDown(self):
        if self.document.file and os.path.exists(self.document.file.path):
            os.remove(self.document.file.path)
