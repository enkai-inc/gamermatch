import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, parseBody } from '@/lib/api-utils';
import { success, notFound, forbidden, serverError } from '@/lib/api-response';
import { journalEntryUpdateSchema } from '@/lib/validations/journal';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { id } = await context.params;

    const entry = await db.playJournalEntry.findUnique({ where: { id } });
    if (!entry) return notFound('Journal entry');
    if (entry.userId !== userId) return forbidden();

    const parsed = await parseBody(req, journalEntryUpdateSchema);
    if ('error' in parsed) return parsed.error;
    const { data } = parsed;

    const updated = await db.playJournalEntry.update({
      where: { id },
      data: {
        rating: data.rating,
        status: data.status,
        hoursPlayed: data.hoursPlayed,
        notes: data.notes,
        startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            slug: true,
          },
        },
      },
    });

    return success(updated);
  } catch (err) {
    console.error('Journal update error:', err);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { id } = await context.params;

    const entry = await db.playJournalEntry.findUnique({ where: { id } });
    if (!entry) return notFound('Journal entry');
    if (entry.userId !== userId) return forbidden();

    await db.playJournalEntry.delete({ where: { id } });

    return success({ deleted: id });
  } catch (err) {
    console.error('Journal delete error:', err);
    return serverError();
  }
}
