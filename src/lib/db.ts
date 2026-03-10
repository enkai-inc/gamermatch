import { PrismaClient } from '@prisma/client';

// Construct DATABASE_URL from individual ECS env vars if not set
if (!process.env.DATABASE_URL && process.env.DB_HOST) {
  const user = process.env.DB_USERNAME || 'gamermatch';
  const pass = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '5432';
  const name = process.env.DB_NAME || 'gamermatch';
  process.env.DATABASE_URL = `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${name}?sslmode=require`;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
