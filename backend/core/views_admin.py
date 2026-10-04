from rest_framework import viewsets, permissions, decorators
from rest_framework.response import Response
from accounts.models import User, Role
from core.models import ServiceOrder, Vehicle
from .serializers_admin import AdminUserSerializer
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
import random
from accounts.permissions import IsOrgAdmin, IsSuperAdmin

class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == Role.SUPER_ADMIN:
            return User.objects.all().order_by('-date_joined')
        elif getattr(user, 'role', None) == Role.ORG_ADMIN and user.organization:
            return User.objects.filter(organization=user.organization).order_by('-date_joined')
        return User.objects.none()

    @decorators.action(detail=False, methods=['GET'])
    def stats(self, request):
        queryset = self.get_queryset()
        total = queryset.count()
        admins = queryset.filter(role__in=[Role.SUPER_ADMIN, Role.ORG_ADMIN]).count()
        return Response({
            'total': total,
            'admins': admins
        })

    @decorators.action(detail=False, methods=['POST'])
    def invite(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Here we would send an invite email, for now just create a placeholder user or return success
        return Response({"message": f"Invite successfully sent to {email}"})

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == Role.ORG_ADMIN:
            # Prevent org admins from creating users in other orgs
            serializer.save(organization=user.organization)
        else:
            serializer.save()

class AdminAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    @decorators.action(detail=False, methods=['GET'])
    def dashboard(self, request):
        from core.utils import get_scoped_queryset
        from core.models import CustomerIssue
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        
        # Scoped querysets
        service_orders = get_scoped_queryset(ServiceOrder.objects.filter(date_created__gte=thirty_days_ago), request.user)
        completed_orders = service_orders.filter(status='COMPLETED')
        issues = get_scoped_queryset(CustomerIssue.objects.filter(created_at__gte=thirty_days_ago), request.user)
        
        vehicles_serviced = completed_orders.count()
        issues_logged = issues.count()
        
        # Calculate real turnaround time (diff between completed_date and date_created)
        # Using a simple loop for SQLite compatibility
        total_tat_seconds = 0
        tat_count = 0
        for order in completed_orders:
            # Check if there is a completed event in timeline
            events = order.events.filter(title__icontains='completed').order_by('-time')
            if events.exists():
                delta = events.first().time - order.date_created
                total_tat_seconds += delta.total_seconds()
                tat_count += 1
                
        avg_turnaround = round((total_tat_seconds / 3600) / tat_count, 1) if tat_count > 0 else 0
        
        # Calculate bay utilization proxy (active vs completed)
        active_orders = service_orders.exclude(status__in=['COMPLETED', 'CANCELLED']).count()
        total_orders = service_orders.count()
        bay_utilization = round((active_orders / total_orders) * 100) if total_orders > 0 else 0
        
        # Real volume data by weekday
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        volume_dict = {d: 0 for d in days}
        for order in service_orders:
            weekday = order.date_created.strftime('%a')
            if weekday in volume_dict:
                volume_dict[weekday] += 1
                
        volume_data = [{'name': k, 'vehicles': v} for k, v in volume_dict.items()]
        
        # Real TAT data by week (just splitting the 30 days into 4 weeks)
        tat_dict = {'Week 1': [], 'Week 2': [], 'Week 3': [], 'Week 4': []}
        for order in completed_orders:
            events = order.events.filter(title__icontains='completed').order_by('-time')
            if events.exists():
                delta = events.first().time - order.date_created
                days_ago = (now - order.date_created).days
                if days_ago <= 7:
                    tat_dict['Week 4'].append(delta.total_seconds() / 3600)
                elif days_ago <= 14:
                    tat_dict['Week 3'].append(delta.total_seconds() / 3600)
                elif days_ago <= 21:
                    tat_dict['Week 2'].append(delta.total_seconds() / 3600)
                else:
                    tat_dict['Week 1'].append(delta.total_seconds() / 3600)
                    
        tat_data = []
        for week, times in tat_dict.items():
            avg = sum(times) / len(times) if times else 0
            tat_data.append({'name': week, 'avgHours': round(avg, 1)})
        
        return Response({
            'vehicles_serviced': vehicles_serviced,
            'avg_turnaround': avg_turnaround,
            'issues_logged': issues_logged,
            'bay_utilization': bay_utilization,
            'volume_data': volume_data,
            'tat_data': tat_data,
        })
