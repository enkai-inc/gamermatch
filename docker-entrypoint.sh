#!/bin/sh
# Construct DATABASE_URL from individual DB_ env vars if not already set
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-gamermatch}?sslmode=require"
fi

# Write .env file for Prisma Client to read at runtime
# (exec doesn't always pass env vars in all container runtimes)
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL=\"${DATABASE_URL}\"" > /app/.env
  echo "Wrote DATABASE_URL to /app/.env"
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

exec "$@"
