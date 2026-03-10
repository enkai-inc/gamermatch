import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { auth } from '@/lib/auth';
import { validationError, unauthorized } from '@/lib/api-response';

export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<{ data: T } | { error: ReturnType<typeof validationError> }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: validationError(err.flatten()) };
    }
    return { error: validationError('Invalid JSON body') };
  }
}

export function parseSearchParams(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20'))),
    sort: searchParams.get('sort') || undefined,
    order: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
    search: searchParams.get('q') || searchParams.get('search') || undefined,
  };
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: unauthorized() };
  }
  return { userId: session.user.id, session };
}
