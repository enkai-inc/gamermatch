import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.DB_HOST) {
    const user = process.env.DB_USERNAME || 'gamermatch';
    const pass = process.env.DB_PASSWORD || '';
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT || '5432';
    const name = process.env.DB_NAME || 'gamermatch';
    return `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${name}?sslmode=require`;
  }
  return undefined;
}

function createPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();
  if (url) {
    return new PrismaClient({
      datasources: { db: { url } },
    });
  }
  return new PrismaClient();
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
