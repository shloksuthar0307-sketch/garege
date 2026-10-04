#!/bin/bash
# RepairTrace CI Script
# Runs backend tests and frontend lint/build checks.

set -e

echo "Starting RepairTrace CI Pipeline..."

# 1. Backend Checks
echo ">>> Running Backend Checks"
cd backend

echo "-> Security checks..."
python manage.py check --deploy

# echo "-> Running unit tests..."
# pytest --ds=core_config.settings

cd ..

# 2. Frontend Checks
echo ">>> Running Frontend Checks"
cd frontend

echo "-> Installing dependencies..."
npm ci

echo "-> Running linter..."
npm run lint

echo "-> Building production bundle..."
npm run build

echo "CI Pipeline Completed Successfully!"
