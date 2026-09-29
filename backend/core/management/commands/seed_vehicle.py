from django.core.management.base import BaseCommand
from core.models import Vehicle, VehicleHealthCategory, ServiceOrder, ServiceTimelineEvent, ServiceWorkItem, ServicePart, MaintenanceItem, Warranty, VehicleDocument
import uuid
import datetime

class Command(BaseCommand):
    help = 'Seed the database with test vehicle data'

    def handle(self, *args, **kwargs):
        # Create Vehicle
        v = Vehicle.objects.create(
            id=uuid.UUID('00000000-0000-0000-0000-000000000001'),
            make='BMW',
            model='M3',
            year=2024,
            registration_number='GJ-XX-XXXX',
            vin='WBA00000000000001',
            fuel_type='Petrol',
            transmission='Automatic',
            color='Black',
            mileage=24820,
            health_score=84,
            health_status='Good Condition',
            image_url='https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'
        )

        # Health Categories
        VehicleHealthCategory.objects.create(vehicle=v, name='Engine', score=92)
        VehicleHealthCategory.objects.create(vehicle=v, name='Brakes', score=71, warning=True)
        VehicleHealthCategory.objects.create(vehicle=v, name='Tires', score=88)
        VehicleHealthCategory.objects.create(vehicle=v, name='Battery', score=95)
        VehicleHealthCategory.objects.create(vehicle=v, name='Suspension', score=82)
        VehicleHealthCategory.objects.create(vehicle=v, name='Electrical', score=90)

        # Service Orders
        s1 = ServiceOrder.objects.create(
            vehicle=v, order_number='RT-2026-00124', title='Major Service', type='Repair',
            status='COMPLETED', progress=100, technician='Alex Morgan', advisor='Sarah Wilson',
            workshop='Downtown Branch', parts_cost=12400, labor_cost=5500, tax=4600, total_cost=22500,
            date_created=datetime.datetime(2026, 3, 12, 9, 0, tzinfo=datetime.timezone.utc),
            date_completed=datetime.datetime(2026, 3, 12, 16, 0, tzinfo=datetime.timezone.utc)
        )
        
        ServiceTimelineEvent.objects.create(service_order=s1, title='Vehicle Received', time=datetime.datetime(2026, 3, 12, 9, 15, tzinfo=datetime.timezone.utc), completed=True)
        ServiceTimelineEvent.objects.create(service_order=s1, title='Inspection Started', time=datetime.datetime(2026, 3, 12, 9, 45, tzinfo=datetime.timezone.utc), completed=True)
        ServiceTimelineEvent.objects.create(service_order=s1, title='Issues Identified', time=datetime.datetime(2026, 3, 12, 10, 30, tzinfo=datetime.timezone.utc), completed=True)
        ServiceTimelineEvent.objects.create(service_order=s1, title='Customer Approved', time=datetime.datetime(2026, 3, 12, 11, 10, tzinfo=datetime.timezone.utc), completed=True)
        ServiceTimelineEvent.objects.create(service_order=s1, title='Repair Started', time=datetime.datetime(2026, 3, 12, 11, 45, tzinfo=datetime.timezone.utc), completed=True)
        ServiceTimelineEvent.objects.create(service_order=s1, title='Repair Completed', time=datetime.datetime(2026, 3, 12, 14, 20, tzinfo=datetime.timezone.utc), completed=True)
        ServiceTimelineEvent.objects.create(service_order=s1, title='Quality Check', time=datetime.datetime(2026, 3, 12, 15, 5, tzinfo=datetime.timezone.utc), completed=True)
        ServiceTimelineEvent.objects.create(service_order=s1, title='Delivered', time=datetime.datetime(2026, 3, 12, 16, 0, tzinfo=datetime.timezone.utc), completed=True)

        for work in ['Engine inspection', 'Oil replacement', 'Brake inspection', 'Tire inspection', 'Battery check']:
            ServiceWorkItem.objects.create(service_order=s1, description=work)
        
        for part in ['Engine Oil', 'Oil Filter', 'Brake Cleaner', 'Air Filter']:
            ServicePart.objects.create(service_order=s1, name=part)

        s2 = ServiceOrder.objects.create(
            vehicle=v, order_number='RT-2025-00890', title='Brake Service', type='Maintenance',
            status='COMPLETED', progress=100, parts_cost=4000, labor_cost=3000, tax=1200, total_cost=8200,
            date_created=datetime.datetime(2025, 11, 8, 10, 0, tzinfo=datetime.timezone.utc),
            date_completed=datetime.datetime(2025, 11, 8, 14, 0, tzinfo=datetime.timezone.utc)
        )
        s3 = ServiceOrder.objects.create(
            vehicle=v, order_number='RT-2025-00450', title='Oil Change', type='Maintenance',
            status='COMPLETED', progress=100, parts_cost=2000, labor_cost=2000, tax=500, total_cost=4500,
            date_created=datetime.datetime(2025, 7, 21, 9, 0, tzinfo=datetime.timezone.utc),
            date_completed=datetime.datetime(2025, 7, 21, 11, 0, tzinfo=datetime.timezone.utc)
        )
        
        # Active service
        s4 = ServiceOrder.objects.create(
            vehicle=v, order_number='RT-2026-00444', title='Brake & General Inspection', type='Inspection',
            status='IN_PROGRESS', progress=78, technician='Alex Morgan', advisor='Sarah Wilson',
            workshop='Downtown Branch', date_created=datetime.datetime.now(datetime.timezone.utc)
        )

        # Maintenance
        MaintenanceItem.objects.create(vehicle=v, title='Brake Inspection', due_text='800 km remaining', status='Due Soon', is_urgent=True)
        MaintenanceItem.objects.create(vehicle=v, title='Engine Oil', due_text='1,200 km remaining', status='Upcoming', is_urgent=False)
        MaintenanceItem.objects.create(vehicle=v, title='Tire Rotation', due_text='1,800 km remaining', status='Upcoming', is_urgent=False)

        # Warranty
        Warranty.objects.create(vehicle=v, title='Engine Warranty', status='Active', expires_date=datetime.date(2028, 6, 14), coverage='50,000 km')
        Warranty.objects.create(vehicle=v, title='Brake Components', status='Active', coverage='10,000 km')
        Warranty.objects.create(vehicle=v, title='Battery', status='Expires Soon', coverage='3 years')

        # Documents
        VehicleDocument.objects.create(vehicle=v, title='Registration Certificate', subtitle='Added March 2025')
        VehicleDocument.objects.create(vehicle=v, title='Insurance', subtitle='Expires August 2027')
        VehicleDocument.objects.create(vehicle=v, title='Purchase Invoice', subtitle='Added March 2025')
        VehicleDocument.objects.create(vehicle=v, title='Service Manual', subtitle='Added March 2025')

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with vehicle data!'))
