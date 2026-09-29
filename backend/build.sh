#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

if [ "$RESET_DB_ON_DEPLOY" = "true" ]; then
    echo "⚠️ RESET_DB_ON_DEPLOY is set to true. Wiping the database schema..."
    python manage.py shell -c "from django.db import connection; cursor = connection.cursor(); cursor.execute('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')"
    echo "Database schema wiped cleanly!"
fi

python manage.py collectstatic --no-input --clear
echo "Collecting static files"
python manage.py migrate
