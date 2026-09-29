from django.core.management.base import BaseCommand
from core.models import Vehicle, VehicleHealthCategory, ServiceOrder, ServiceTimelineEvent, ServiceWorkItem, ServicePart, MaintenanceItem, Warranty, VehicleDocument
import uuid
import datetime

class Command(BaseCommand):
    help = 'Seed the database with all 3 test vehicles'

    def handle(self, *args, **kwargs):
        # Clear existing
        Vehicle.objects.all().delete()

        def create_vehicle(v_id, make, model, year, reg, hp, is_in_service):
            v = Vehicle.objects.create(
                id=uuid.UUID(v_id),
                make=make,
                model=model,
                year=year,
                registration_number=reg,
                vin=f'WBA000{year}000{hp}',
                fuel_type='Petrol',
                transmission='Automatic',
                color='Black',
                mileage=hp * 42,
                health_score=hp % 30 + 70,
                health_status='Good Condition',
            )

            VehicleHealthCategory.objects.create(vehicle=v, name='Engine', score=92)
            VehicleHealthCategory.objects.create(vehicle=v, name='Brakes', score=71, warning=True)
            VehicleHealthCategory.objects.create(vehicle=v, name='Tires', score=88)

            s1 = ServiceOrder.objects.create(
                vehicle=v, order_number=f'RT-{year}-001', title='Major Service', type='Repair',
                status='COMPLETED', progress=100, technician='Alex Morgan', advisor='Sarah Wilson',
                workshop='Downtown Branch', parts_cost=12400, labor_cost=5500, tax=4600, total_cost=22500,
                date_created=datetime.datetime(year, 3, 12, 9, 0, tzinfo=datetime.timezone.utc),
                date_completed=datetime.datetime(year, 3, 12, 16, 0, tzinfo=datetime.timezone.utc)
            )
            
            ServiceTimelineEvent.objects.create(service_order=s1, title='Delivered', time=datetime.datetime(year, 3, 12, 16, 0, tzinfo=datetime.timezone.utc), completed=True)
            ServiceWorkItem.objects.create(service_order=s1, description='Engine inspection')
            ServicePart.objects.create(service_order=s1, name='Engine Oil')

            if is_in_service:
                ServiceOrder.objects.create(
                    vehicle=v, order_number=f'RT-{year+1}-002', title='Brake Inspection', type='Inspection',
                    status='IN_PROGRESS', progress=78, technician='Alex Morgan', advisor='Sarah Wilson',
                    workshop='Downtown Branch', date_created=datetime.datetime.now(datetime.timezone.utc)
                )

            MaintenanceItem.objects.create(vehicle=v, title='Brake Inspection', due_text='800 km remaining', status='Due Soon', is_urgent=True)
            Warranty.objects.create(vehicle=v, title='Engine Warranty', status='Active', expires_date=datetime.date(2028, 6, 14), coverage='50,000 km')
            VehicleDocument.objects.create(vehicle=v, title='Registration Certificate', subtitle='Added March 2025')
            
            return v

        v1 = create_vehicle('00000000-0000-0000-0000-000000000001', 'PORSCHE', '718 CAYMAN', 2025, 'GJ-XX-XXXX', 300, True)
        v2 = create_vehicle('00000000-0000-0000-0000-000000000002', 'BMW', 'M4 COMPETITION', 2024, 'MH-YY-YYYY', 503, False)
        v3 = create_vehicle('00000000-0000-0000-0000-000000000003', 'MERCEDES-BENZ', 'G63 AMG', 2023, 'DL-ZZ-ZZZZ', 577, False)

        self.stdout.write(self.style.SUCCESS('Successfully seeded all 3 vehicles!'))
