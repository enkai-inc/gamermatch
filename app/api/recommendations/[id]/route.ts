import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-utils';
import { success, notFound, forbidden, serverError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { id } = await params;

    // Verify recommendation exists and belongs to user
    const rec = await db.recommendation.findUnique({ where: { id } });
    if (!rec) return notFound('Recommendation');
    if (rec.userId !== userId) return forbidden();

    const body = await req.json();
    const update: any = {};

    if (body.dismissed === true) {
      update.dismissed = true;
    }
    if (body.clicked === true) {
      update.clicked = true;
    }

    const updated = await db.recommendation.update({
      where: { id },
      data: update,
    });

    return success(updated);
  } catch (err) {
    console.error('Recommendation update error:', err);
    return serverError();
  }
}
