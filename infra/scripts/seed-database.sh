#!/usr/bin/env bash
# Seed / initialise the PostgreSQL database by applying the Flyway migration
# SQL scripts shipped with the backend.
# Usage: ./seed-database.sh [env]
set -euo pipefail

ENV="${1:-dev}"

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-payment}"
DB_NAME="${DB_NAME:-paymentplatform}"
DB_PASSWORD="${DB_PASSWORD:-payment}"

MIGRATIONS_DIR="../backend/src/main/resources/db/migration"
if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "Migrations directory not found: $MIGRATIONS_DIR" >&2
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

echo "Ensuring database '${DB_NAME}' exists..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -tc \
  "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" \
  | grep -q 1 || \
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE \"${DB_NAME}\""

echo "Applying migrations from ${MIGRATIONS_DIR}..."
for f in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  echo " -> applying $(basename "$f")"
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$f"
done

echo "Seed complete for env=${ENV}."
