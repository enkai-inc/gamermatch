import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'unknown';
  let dbError: string | undefined;
  try {
    await db.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'disconnected';
    dbError = e instanceof Error ? e.message : String(e);
    console.error('DB health check failed:', e);
  }

  return NextResponse.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    ...(dbError ? { dbError } : {}),
    environment: process.env.NODE_ENV || 'unknown',
  });
}
