#!/bin/sh
# Construct DATABASE_URL from individual DB_ env vars if not already set
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-gamermatch}?sslmode=require"
fi

exec "$@"
