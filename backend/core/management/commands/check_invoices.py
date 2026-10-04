from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import Invoice, SystemNotification
from django.db import transaction
from core.utils import safe_group_send

class Command(BaseCommand):
    help = 'Checks for pending and overdue invoices and sends notifications to customers'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        
        # Invoices that are unpaid
        pending_invoices = Invoice.objects.filter(status='UNPAID')
        
        for invoice in pending_invoices:
            if not invoice.due_date:
                continue
                
            days_until_due = (invoice.due_date - today).days
            
            notification_title = None
            notification_message = None
            update_type = None
            
            if days_until_due == 3:
                # Approaching due date
                notification_title = 'Upcoming Bill Reminder'
                notification_message = f'Your invoice {invoice.invoice_number} for ₹{invoice.amount - invoice.paid} is due in 3 days ({invoice.due_date}).'
                update_type = 'INVOICE_REMINDER'
            elif days_until_due == 0:
                # Due today
                notification_title = 'Bill Due Today'
                notification_message = f'Your invoice {invoice.invoice_number} for ₹{invoice.amount - invoice.paid} is due today.'
                update_type = 'INVOICE_DUE'
            elif days_until_due < 0:
                # Overdue
                notification_title = 'Overdue Bill Notice'
                notification_message = f'Your invoice {invoice.invoice_number} for ₹{invoice.amount - invoice.paid} was due on {invoice.due_date} and is now overdue. Please make a payment as soon as possible.'
                update_type = 'INVOICE_OVERDUE'
            with transaction.atomic():
                if update_type == 'INVOICE_OVERDUE':
                    invoice.status = 'OVERDUE'
                    invoice.save()
                
            if notification_message and invoice.customer:
                # Create System Notification
                with transaction.atomic():
                    SystemNotification.objects.create(
                        user=invoice.customer,
                        notification_type='ALERT' if days_until_due <= 0 else 'INFO',
                        title=notification_title,
                        message=notification_message,
                    )
                    
                # Send WebSocket Update to Customer
                safe_group_send(
                    f'customer_updates_{invoice.customer.id}',
                    {
                        'type': 'send_update',
                        'update_type': update_type,
                        'message': notification_message,
                    }
                )
                
                # Also notify dashboards so the UI updates automatically
                groups = ['admin_updates']
                if invoice.branch:
                    groups.append(f'branch_updates_{invoice.branch.id}')
                    if invoice.branch.organization_id:
                        groups.append(f'org_updates_{invoice.branch.organization_id}')
                        
                for group in groups:
                    safe_group_send(
                        group,
                        {
                            'type': 'send_update',
                            'update_type': 'INVOICE_STATUS_CHANGED',
                            'message': f'Invoice {invoice.invoice_number} status is now {notification_title}'
                        }
                    )

        # Check existing OVERDUE invoices for repeated reminders
        overdue_invoices = Invoice.objects.filter(status='OVERDUE')
        for invoice in overdue_invoices:
            if not invoice.due_date:
                continue
                
            days_overdue = (today - invoice.due_date).days
            # Send reminder every 7 days
            if days_overdue > 0 and days_overdue % 7 == 0:
                notification_title = 'Second Notice: Overdue Bill'
                notification_message = f'Reminder: Your invoice {invoice.invoice_number} is overdue by {days_overdue} days. Pending amount: ₹{invoice.amount - invoice.paid}.'
                
                if invoice.customer:
                    with transaction.atomic():
                        SystemNotification.objects.create(
                            user=invoice.customer,
                            notification_type='ALERT',
                            title=notification_title,
                            message=notification_message,
                        )
                        
                    safe_group_send(
                        f'customer_updates_{invoice.customer.id}',
                        {
                            'type': 'send_update',
                            'update_type': 'INVOICE_REMINDER',
                            'message': notification_message,
                        }
                    )

        self.stdout.write(self.style.SUCCESS('Successfully checked invoices and sent notifications'))
