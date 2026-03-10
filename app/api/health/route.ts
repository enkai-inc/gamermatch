import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  let dbStatus = 'unknown';
  try {
    await db.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  return NextResponse.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'unknown',
  });
}
