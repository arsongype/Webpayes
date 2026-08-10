#!/usr/bin/env bash
# Backup the PostgreSQL database used by the platform.
# Usage: ./backup-db.sh [env]
# Requires: pg_dump, and the following env vars (or defaults):
#   DB_HOST (postgres) DB_PORT (5432) DB_USER (payment)
#   DB_NAME (paymentplatform) DB_PASSWORD
set -euo pipefail

ENV="${1:-dev}"
BACKUP_DIR="./backups/${ENV}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-payment}"
DB_NAME="${DB_NAME:-paymentplatform}"
DB_PASSWORD="${DB_PASSWORD:-payment}"

mkdir -p "$BACKUP_DIR"

export PGPASSWORD="$DB_PASSWORD"

echo "Backing up ${DB_NAME}@${DB_HOST}:${DB_PORT} -> ${BACKUP_DIR}/${DB_NAME}-${TIMESTAMP}.sql.gz"
pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner --clean --if-exists \
  | gzip > "${BACKUP_DIR}/${DB_NAME}-${TIMESTAMP}.sql.gz"

echo "Backup complete: ${BACKUP_DIR}/${DB_NAME}-${TIMESTAMP}.sql.gz"
