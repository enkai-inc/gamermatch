#!/bin/sh
# Construct DATABASE_URL from individual DB_ env vars if not already set
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-gamermatch}?sslmode=require"
fi

# Run Prisma migrations and seed on startup (idempotent)
if [ -n "$DATABASE_URL" ] && [ -f prisma/schema.prisma ]; then
  echo "Running database migrations..."
  node node_modules/prisma/build/index.js migrate deploy 2>&1 || echo "Migration warning"

  if [ -f prisma/compiled/prisma/seed.js ]; then
    echo "Running database seed..."
    node prisma/compiled/prisma/seed.js 2>&1 || echo "Seed skipped (may already exist)"
  fi
fi

echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'no')"
echo "DATABASE_URL length: ${#DATABASE_URL}"
exec "$@"
