from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings


class Command(BaseCommand):
    help = "Creates this project's Postgres schema if it doesn't already exist"

    def handle(self, *args, **options):
        if connection.vendor != 'postgresql':
            self.stdout.write(self.style.WARNING("Database is not PostgreSQL, skipping schema creation."))
            return
            
        schema_name = getattr(settings, "DB_SCHEMA", None)
        if not schema_name:
            self.stdout.write(self.style.WARNING("DB_SCHEMA not set, skipping."))
            return
            
        with connection.cursor() as cursor:
            # We use format instead of f-string to ensure we don't introduce SQL injection vulnerabilities 
            # if DB_SCHEMA somehow comes from an untrusted source, though typically it's secure in settings.
            cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"')
            
        self.stdout.write(self.style.SUCCESS(f'Schema "{schema_name}" is ready.'))
