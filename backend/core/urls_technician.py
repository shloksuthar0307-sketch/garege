from django.urls import path
from . import views_technician as views

urlpatterns = [
    path('dashboard/', views.technician_dashboard_stats, name='tech-dashboard-stats'),
    path('work-orders/', views.technician_service_orders, name='tech-work-orders'),
    path('work-orders/<uuid:pk>/', views.technician_service_order_detail, name='tech-work-order-detail'),
    path('work-orders/<uuid:pk>/inspection/', views.technician_inspection, name='tech-inspection'),
    path('work-orders/<uuid:pk>/issues/', views.technician_report_issue, name='tech-report-issue'),
    path('issues/<uuid:issue_id>/evidence/', views.technician_add_evidence, name='tech-add-evidence'),
    path('work-orders/<uuid:pk>/repairs/', views.technician_repair_tasks, name='tech-repair-tasks'),
    path('repairs/<uuid:task_id>/progress/', views.technician_update_repair_progress, name='tech-repair-progress'),
    path('work-orders/<uuid:pk>/photos/', views.technician_upload_photo, name='tech-upload-photo'),

    # Labor
    path('labor/', views.technician_log_labor, name='tech-log-labor'),
    path('labor/start/<uuid:task_id>/', views.labor_session_start, name='tech-labor-start'),
    path('labor/pause/<uuid:session_id>/', views.labor_session_pause, name='tech-labor-pause'),
    path('labor/resume/<uuid:session_id>/', views.labor_session_resume, name='tech-labor-resume'),
    path('labor/stop/<uuid:session_id>/', views.labor_session_stop, name='tech-labor-stop'),
    path('labor/active/', views.labor_session_active, name='tech-labor-active'),
    path('labor/history/', views.labor_session_history, name='tech-labor-history'),
    
    # Diagnostics
    path('diagnostics/scan/', views.diagnostic_run_scan, name='tech-diagnostic-scan'),
    path('diagnostics/scan/<uuid:scan_id>/save/', views.diagnostic_save_results, name='tech-diagnostic-save'),
    
    # Notifications
    path('notifications/', views.notification_list, name='tech-notification-list'),
    path('notifications/<uuid:notification_id>/read/', views.notification_mark_read, name='tech-notification-mark-read'),
    path('notifications/read-all/', views.notification_mark_all_read, name='tech-notification-mark-all-read'),
    
    # Sync
    path('sync/batch/', views.sync_batch, name='tech-sync-batch'),
    # AI Inspection
    path('inspections/<uuid:pk>/ai-analyze/', views.upload_and_analyze_photo, name='tech-ai-analyze'),
    path('inspections/<uuid:pk>/ai-findings/', views.get_ai_findings, name='tech-ai-findings'),
    path('ai-findings/<uuid:finding_id>/confirm/', views.confirm_ai_finding, name='tech-ai-confirm'),
    path('ai-findings/<uuid:finding_id>/reject/', views.reject_ai_finding, name='tech-ai-reject'),
]
