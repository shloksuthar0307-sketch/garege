#!/bin/bash
# RepairTrace Restore Script
# Usage: ./restore.sh <db_backup_file> <media_backup_file>

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./restore.sh <db_backup_file> <media_backup_file>"
    exit 1
fi

DB_BACKUP=$1
MEDIA_BACKUP=$2

echo "Starting RepairTrace restoration..."

# 1. Database Restoration
if [[ "$DB_BACKUP" == *.sql ]]; then
    if [ -n "$DATABASE_URL" ]; then
        echo "Restoring PostgreSQL database..."
        pg_restore --clean --if-exists --no-owner --no-privileges -d $DATABASE_URL "$DB_BACKUP"
    else
        echo "Error: DATABASE_URL not set for pg_restore."
        exit 1
    fi
elif [[ "$DB_BACKUP" == *.sqlite3 ]]; then
    echo "Restoring SQLite database..."
    cp "$DB_BACKUP" db.sqlite3
fi

# 2. Media Files Restoration
if [ -f "$MEDIA_BACKUP" ]; then
    echo "Restoring media files..."
    tar -xzf "$MEDIA_BACKUP"
fi

echo "Restoration completed successfully."
