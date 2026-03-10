import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-utils';
import { success, notFound, serverError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;

    const existing = await db.tasteProfile.findUnique({
      where: { userId: authResult.userId },
    });

    if (!existing) {
      return notFound('Taste profile');
    }

    const profile = await db.tasteProfile.update({
      where: { userId: authResult.userId },
      data: {
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return success(profile);
  } catch (err) {
    console.error('Taste profile complete error:', err);
    return serverError();
  }
}
