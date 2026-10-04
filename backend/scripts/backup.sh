#!/bin/bash
# RepairTrace Backup Script
# Use this script to backup the database and media files.

BACKUP_DIR="/var/backups/repairtrace"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP="$BACKUP_DIR/db_$TIMESTAMP.sql"
MEDIA_BACKUP="$BACKUP_DIR/media_$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting RepairTrace backup..."

# 1. Database Backup
if [ -n "$DATABASE_URL" ] || [ -n "$PGHOST" ]; then
    echo "Backing up PostgreSQL database..."
    pg_dump -Fc $DATABASE_URL > "$DB_BACKUP"
    echo "Database backup saved to $DB_BACKUP"
else
    echo "Backing up SQLite database..."
    sqlite3 db.sqlite3 ".backup '$BACKUP_DIR/db_$TIMESTAMP.sqlite3'"
    echo "Database backup saved to $BACKUP_DIR/db_$TIMESTAMP.sqlite3"
fi

# 2. Media Files Backup
if [ -d "media" ]; then
    echo "Backing up media files..."
    tar -czf "$MEDIA_BACKUP" media/
    echo "Media backup saved to $MEDIA_BACKUP"
fi

echo "Backup completed successfully."
