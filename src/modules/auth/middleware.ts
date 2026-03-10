import { NextRequest, NextResponse } from 'next/server';

export function authMiddleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: Verify token (JWT or session)
  return NextResponse.next();
}
