from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import (
    ServiceOrder, VehicleInspection, InspectionItem, 
    Issue, IssueEvidence, RepairTask, RepairProgress,
    ServiceTimelineEvent
)
from .serializers_technician import (
    TechnicianServiceOrderListSerializer, TechnicianServiceOrderDetailSerializer,
    TechnicianInspectionSerializer, TechnicianIssueSerializer,
    TechnicianRepairTaskSerializer
)
from django.shortcuts import get_object_or_404
from datetime import timedelta

from accounts.permissions import IsTechnician
from core.utils import get_scoped_queryset

@api_view(['GET'])
@permission_classes([IsTechnician])
def technician_dashboard_stats(request):
    # Only get assigned orders. In a real app we'd filter by assignments.
    # For now, let's filter by technician username if assigned directly, or assume they see ones in IN_PROGRESS/PENDING
    orders = ServiceOrder.objects.filter(technician=request.user.username)
    if not orders.exists():
        # Fallback to general branch orders if model isn't fully linked
        orders = ServiceOrder.objects.filter(status__in=['PENDING', 'IN_PROGRESS'])

    todays_jobs = orders.count()
    active_repairs = RepairTask.objects.filter(service_order__in=orders, status='IN_PROGRESS').count()
    pending_inspections = orders.filter(status='PENDING').count()
    issues_reported = Issue.objects.filter(technician=request.user).count()
    
    # Example stats
    return Response({
        'todays_jobs': todays_jobs,
        'active_repairs': active_repairs,
        'pending_inspections': pending_inspections,
        'issues_reported': issues_reported,
        'waiting_parts': RepairTask.objects.filter(service_order__in=orders, status='WAITING_FOR_PARTS').count(),
        'completed_today': orders.filter(status='COMPLETED', date_completed__date=timezone.now().date()).count()
    })

@api_view(['GET'])
@permission_classes([IsTechnician])
def technician_service_orders(request):
    # Get jobs assigned or available for technician
    orders = ServiceOrder.objects.exclude(status='CANCELLED').select_related('vehicle')
    orders = get_scoped_queryset(orders, request.user)
    serializer = TechnicianServiceOrderListSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsTechnician])
def technician_service_order_detail(request, pk):
    qs = ServiceOrder.objects.select_related('vehicle')
    qs = get_scoped_queryset(qs, request.user)
    order = get_object_or_404(qs, pk=pk)
    serializer = TechnicianServiceOrderDetailSerializer(order)
    data = serializer.data
    
    # Attach inspection and repair tasks explicitly if needed, or rely on separate endpoints
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsTechnician])
def technician_inspection(request, pk):
    qs = ServiceOrder.objects.all()
    qs = get_scoped_queryset(qs, request.user)
    order = get_object_or_404(qs, pk=pk)
    
    if request.method == 'GET':
        inspection = order.inspections.prefetch_related('items', 'items__issues', 'items__issues__evidence').first()
        if not inspection:
            return Response({'detail': 'No inspection found'}, status=404)
        serializer = TechnicianInspectionSerializer(inspection)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        # Start inspection
        if not order.inspections.exists():
            inspection = VehicleInspection.objects.create(
                service_order=order,
                advisor=request.user,  # Technician starts it
                customer_concern=request.data.get('customer_concern', '')
            )
            # Create timeline event
            ServiceTimelineEvent.objects.create(
                service_order=order,
                title=f"Inspection Started by {request.user.username}",
                time=timezone.now()
            )
            order.status = 'IN_PROGRESS'
            order.save()
            return Response(TechnicianInspectionSerializer(inspection).data, status=201)
        return Response({'detail': 'Inspection already exists'}, status=400)

@api_view(['POST'])
@permission_classes([IsTechnician])
def technician_report_issue(request, pk):
    qs = ServiceOrder.objects.all()
    qs = get_scoped_queryset(qs, request.user)
    order = get_object_or_404(qs, pk=pk)
    data = request.data
    issue = Issue.objects.create(
        service_order=order,
        component=data.get('component'),
        issue_type=data.get('issue_type'),
        severity=data.get('severity'),
        description=data.get('description'),
        measurement=data.get('measurement', ''),
        recommendation=data.get('recommendation', ''),
        technician=request.user,
        is_additional=data.get('is_additional', False)
    )
    
    # Create timeline event
    ServiceTimelineEvent.objects.create(
        service_order=order,
        title=f"Issue Reported: {issue.component} ({issue.severity})",
        time=timezone.now()
    )
    
    serializer = TechnicianIssueSerializer(issue)
    return Response(serializer.data, status=201)

@api_view(['POST'])
@permission_classes([IsTechnician])
def technician_add_evidence(request, issue_id):
    issue_qs = Issue.objects.all()
    issue_qs = get_scoped_queryset(issue_qs, request.user, branch_lookup='service_order__branch')
    issue = get_object_or_404(issue_qs, pk=issue_id)
    
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
    file_type = request.data.get('file_type', 'image')
    description = request.data.get('description', '')
    
    evidence = IssueEvidence.objects.create(
        issue=issue,
        file=file_obj,
        file_type=file_type,
        description=description,
        technician=request.user
    )
    
    # Optionally set file_url if needed for backward compatibility
    if evidence.file:
        evidence.file_url = evidence.file.url
        evidence.save()
    
    ServiceTimelineEvent.objects.create(
        service_order=issue.service_order,
        title=f"Evidence added to {issue.component}",
        time=timezone.now()
    )
    
    return Response({'id': evidence.id, 'file_url': evidence.file_url}, status=201)

@api_view(['GET'])
@permission_classes([IsTechnician])
def technician_repair_tasks(request, pk):
    qs = ServiceOrder.objects.all()
    qs = get_scoped_queryset(qs, request.user)
    order = get_object_or_404(qs, pk=pk)
    tasks = order.repair_tasks.all().prefetch_related('progress_updates')
    serializer = TechnicianRepairTaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsTechnician])
def technician_update_repair_progress(request, task_id):
    task_qs = RepairTask.objects.all()
    task_qs = get_scoped_queryset(task_qs, request.user, branch_lookup='service_order__branch')
    task = get_object_or_404(task_qs, pk=task_id)
    percentage = request.data.get('percentage', task.progress_updates.last().percentage if task.progress_updates.exists() else 0)
    note = request.data.get('note', '')
    status = request.data.get('status')
    
    progress = RepairProgress.objects.create(
        task=task,
        percentage=percentage,
        note=note,
        technician=request.user
    )
    
    if status and status != task.status:
        if status == 'IN_PROGRESS' and hasattr(task.service_order, 'service_estimate'):
            if task.service_order.service_estimate.status != 'APPROVED':
                return Response({'error': 'Repair work cannot begin until the estimate is approved.'}, status=400)
                
        task.status = status
        if status == 'COMPLETED':
            task.completed_at = timezone.now()
        elif status == 'IN_PROGRESS' and not task.started_at:
            task.started_at = timezone.now()
        task.save()
        ServiceTimelineEvent.objects.create(
            service_order=task.service_order,
            title=f"Task '{task.name}' status changed to {status}",
            time=timezone.now()
        )
        
        # Notify Customer
        from .models import SystemNotification
        if task.service_order.vehicle and task.service_order.vehicle.owner:
            SystemNotification.objects.create(
                user=task.service_order.vehicle.owner,
                notification_type='INFO',
                title='Repair Update',
                message=f"Task '{task.name}' is now {status.replace('_', ' ')}.",
                action_url='/customer/dashboard'
            )
        
    # Recalculate aggregate progress
    order = task.service_order
    tasks = order.repair_tasks.all()
    if tasks.exists():
        total_pct = sum([t.progress_updates.last().percentage if t.progress_updates.exists() else 0 for t in tasks])
        order.progress = int(total_pct / tasks.count())
        
        # If all tasks are completed, change order status to QUALITY_CHECK if it was IN_WORKSHOP
        all_completed = all(t.status == 'COMPLETED' for t in tasks)
        if all_completed and order.status == 'IN_WORKSHOP':
            order.status = 'QUALITY_CHECK'
            
        order.save(update_fields=['progress', 'status'])
        
        # Broadcast the update
        from core.signals import broadcast_dashboard_update
        broadcast_dashboard_update(order, 'SERVICE_ORDER_UPDATED', f"Repair progress updated to {order.progress}%")
        
    return Response({'detail': 'Progress updated'})



from .models import LaborSession, DiagnosticScan, DiagnosticCode, TechnicianNotification, OfflineSyncEvent
from .serializers_technician import (
    LaborSessionSerializer, DiagnosticScanSerializer, 
    DiagnosticCodeSerializer, TechnicianNotificationSerializer, OfflineSyncEventSerializer
)


@api_view(['POST'])
@permission_classes([IsTechnician])
def technician_log_labor(request):
    job_id = request.data.get('job_id')
    qs = ServiceOrder.objects.all()
    qs = get_scoped_queryset(qs, request.user)
    order = get_object_or_404(qs, pk=job_id)
    duration_ms = request.data.get('duration_ms', 0)
    
    try:
        duration_ms = int(duration_ms)
    except (ValueError, TypeError):
        duration_ms = 0
        
    duration_seconds = duration_ms // 1000
    
    ended_at = timezone.now()
    started_at = ended_at - timedelta(milliseconds=duration_ms)
    
    session = LaborSession.objects.create(
        technician=request.user,
        service_order=order,
        status='COMPLETED',
        ended_at=ended_at,
        active_duration=duration_seconds
    )
    # Fix auto_now_add started_at field
    LaborSession.objects.filter(pk=session.pk).update(started_at=started_at)
    session.refresh_from_db()
    
    return Response({'status': 'success', 'labor_session_id': session.id}, status=200)

@api_view(['POST'])
@permission_classes([IsTechnician])
def labor_session_start(request, task_id):
    task_qs = RepairTask.objects.all()
    task_qs = get_scoped_queryset(task_qs, request.user, branch_lookup='service_order__branch')
    task = get_object_or_404(task_qs, pk=task_id)
    session = LaborSession.objects.create(
        technician=request.user,
        service_order=task.service_order,
        repair_task=task,
        status='ACTIVE'
    )
    return Response(LaborSessionSerializer(session).data, status=201)

@api_view(['POST'])
@permission_classes([IsTechnician])
def labor_session_pause(request, session_id):
    session = get_object_or_404(LaborSession, pk=session_id, technician=request.user)
    if session.status == 'ACTIVE':
        # logic to update active_duration
        # For simplicity, we just change status here
        session.status = 'PAUSED'
        session.save()
    return Response(LaborSessionSerializer(session).data)

@api_view(['POST'])
@permission_classes([IsTechnician])
def labor_session_resume(request, session_id):
    session = get_object_or_404(LaborSession, pk=session_id, technician=request.user)
    if session.status == 'PAUSED':
        session.status = 'ACTIVE'
        session.save()
    return Response(LaborSessionSerializer(session).data)

@api_view(['POST'])
@permission_classes([IsTechnician])
def labor_session_stop(request, session_id):
    session = get_object_or_404(LaborSession, pk=session_id, technician=request.user)
    session.status = 'COMPLETED'
    session.ended_at = timezone.now()
    session.save()
    return Response(LaborSessionSerializer(session).data)

@api_view(['GET'])
@permission_classes([IsTechnician])
def labor_session_active(request):
    sessions = LaborSession.objects.filter(technician=request.user, status='ACTIVE')
    return Response(LaborSessionSerializer(sessions, many=True).data)

@api_view(['GET'])
@permission_classes([IsTechnician])
def labor_session_history(request):
    sessions = LaborSession.objects.filter(technician=request.user).order_by('-created_at')
    return Response(LaborSessionSerializer(sessions, many=True).data)

@api_view(['POST'])
@permission_classes([IsTechnician])
def diagnostic_run_scan(request):
    vehicle_id = request.data.get('vehicle_id')
    vehicle = get_object_or_404(__import__('core.models').models.Vehicle, pk=vehicle_id)
    scan = DiagnosticScan.objects.create(
        vehicle=vehicle,
        technician=request.user,
        source=request.data.get('source', 'OBD2'),
        status='COMPLETED'
    )
    # mock code
    DiagnosticCode.objects.create(scan=scan, code='P0300', description='Random/Multiple Cylinder Misfire Detected')
    return Response(DiagnosticScanSerializer(scan).data, status=201)

@api_view(['POST'])
@permission_classes([IsTechnician])
def diagnostic_save_results(request, scan_id):
    scan_qs = DiagnosticScan.objects.all()
    scan_qs = get_scoped_queryset(scan_qs, request.user, branch_lookup='service_order__branch')
    scan = get_object_or_404(scan_qs, pk=scan_id)
    scan.notes = request.data.get('notes', scan.notes)
    scan.save()
    return Response(DiagnosticScanSerializer(scan).data)

@api_view(['GET'])
@permission_classes([IsTechnician])
def notification_list(request):
    notifications = TechnicianNotification.objects.filter(recipient=request.user).order_by('-created_at')
    return Response(TechnicianNotificationSerializer(notifications, many=True).data)

@api_view(['POST'])
@permission_classes([IsTechnician])
def notification_mark_read(request, notification_id):
    notification = get_object_or_404(TechnicianNotification, pk=notification_id, recipient=request.user)
    notification.is_read = True
    notification.read_at = timezone.now()
    notification.save()
    return Response(TechnicianNotificationSerializer(notification).data)

@api_view(['POST'])
@permission_classes([IsTechnician])
def notification_mark_all_read(request):
    notifications = TechnicianNotification.objects.filter(recipient=request.user, is_read=False)
    notifications.update(is_read=True, read_at=timezone.now())
    return Response({'status': 'success'})

@api_view(['POST'])
@permission_classes([IsTechnician])
def sync_batch(request):
    payload = request.data.get('payload', [])
    for item in payload:
        OfflineSyncEvent.objects.create(
            user=request.user,
            action=item.get('action'),
            payload=item.get('data', {}),
            status='SYNCED',
            synced_at=timezone.now()
        )
    return Response({'status': 'success'})


# AI Inspection Features
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import TechnicianPhoto, AIFinding, VehicleInspection, DiagnosticFinding
from .services_ai import AIInspectionService

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_and_analyze_photo(request, pk):
    inspection = get_object_or_404(VehicleInspection, pk=pk)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
    image_file = request.FILES['image']
    
    from core.utils import validate_file_upload
    try:
        validate_file_upload(image_file, allowed_extensions=['.png', '.jpg', '.jpeg'], allowed_mimetypes=['image/png', 'image/jpeg'])
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save the photo
    photo = TechnicianPhoto.objects.create(
        vehicle=inspection.service_order.vehicle,
        service_order=inspection.service_order,
        inspection=inspection,
        technician=request.user,
        image=image_file,
        vehicle_area=request.data.get('vehicle_area', '')
    )
    
    # Run AI Analysis
    try:
        service = AIInspectionService()
        result = service.analyze_vehicle_damage(photo, user=request.user)
        
        findings = []
        for issue in result.get('issues', []):
            finding = AIFinding.objects.create(
                photo=photo,
                vehicle_area=result.get('vehicle_area') or photo.vehicle_area or 'Unknown',
                issue_type=issue.get('type', 'Unknown'),
                severity=issue.get('severity', 'unknown'),
                confidence=issue.get('confidence', 0.0),
                description=issue.get('description', ''),
                recommended_action=issue.get('recommended_action', ''),
                estimated_priority=issue.get('estimated_priority', '')
            )
            findings.append({
                'id': finding.id,
                'vehicle_area': finding.vehicle_area,
                'issue_type': finding.issue_type,
                'severity': finding.severity,
                'confidence': finding.confidence,
                'description': finding.description,
                'recommended_action': finding.recommended_action,
                'status': finding.status
            })
            
        return Response({
            'photo_id': photo.id,
            'findings': findings,
            'overall_condition': result.get('overall_condition', '')
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_ai_findings(request, pk):
    inspection = get_object_or_404(VehicleInspection, pk=pk)
    findings = AIFinding.objects.filter(photo__inspection=inspection).values(
        'id', 'vehicle_area', 'issue_type', 'severity', 'confidence', 'description',
        'recommended_action', 'status', 'created_at'
    )
    return Response(list(findings))

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def technician_upload_photo(request, pk):
    from .models import ServiceOrder, TechnicianPhoto
    qs = get_scoped_queryset(ServiceOrder.objects.all(), request.user)
    order = get_object_or_404(qs, pk=pk)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
    image_file = request.FILES['image']
    
    from core.utils import validate_file_upload
    try:
        validate_file_upload(image_file, allowed_extensions=['.png', '.jpg', '.jpeg', '.mp4'], allowed_mimetypes=['image/png', 'image/jpeg', 'video/mp4'])
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save the photo
    photo = TechnicianPhoto.objects.create(
        vehicle=order.vehicle,
        service_order=order,
        technician=request.user,
        image=image_file,
        vehicle_area=request.data.get('vehicle_area', '')
    )
    
    return Response({
        'photo_id': photo.id,
        'image_url': photo.image.url
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_ai_finding(request, finding_id):
    finding = get_object_or_404(AIFinding, pk=finding_id)
    if finding.status != 'PENDING':
        return Response({'error': 'Finding is already processed'}, status=status.HTTP_400_BAD_REQUEST)
        
    data = request.data
    finding.status = 'CONFIRMED'
    finding.verified_by = request.user
    finding.verified_at = timezone.now()
    
    if 'edited_description' in data:
        finding.description = data['edited_description']
        finding.status = 'EDITED'
        
    finding.save()
    
    # Create DiagnosticFinding
    diag = DiagnosticFinding.objects.create(
        service_order=finding.photo.service_order,
        component=finding.vehicle_area,
        finding=finding.description,
        severity=finding.severity,
        recommendation=finding.recommended_action,
        technician=request.user
    )
    finding.diagnostic_finding = diag
    finding.save()
    
    # Create Timeline Event
    ServiceTimelineEvent.objects.create(
        service_order=finding.photo.service_order,
        title=f"AI Finding Verified: {diag.component}",
        time=timezone.now()
    )
    
    return Response({'status': 'success', 'diagnostic_id': diag.id})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_ai_finding(request, finding_id):
    finding = get_object_or_404(AIFinding, pk=finding_id)
    finding.status = 'REJECTED'
    finding.verified_by = request.user
    finding.verified_at = timezone.now()
    finding.save()
    return Response({'status': 'success'})

