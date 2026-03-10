import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, parseBody, parseSearchParams } from '@/lib/api-utils';
import { success, paginated, conflict, serverError, validationError } from '@/lib/api-response';
import { journalEntrySchema } from '@/lib/validations/journal';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { page, limit, sort, order } = parseSearchParams(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: Prisma.PlayJournalEntryWhereInput = { userId };
    if (status && ['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED', 'ON_HOLD'].includes(status)) {
      where.status = status as Prisma.PlayJournalEntryWhereInput['status'];
    }

    const sortField = sort && ['createdAt', 'rating', 'hoursPlayed'].includes(sort)
      ? sort
      : 'createdAt';

    const orderByClause: Prisma.PlayJournalEntryOrderByWithRelationInput =
      sort === 'title'
        ? { game: { title: order } }
        : { [sortField]: order };

    const [entries, total] = await Promise.all([
      db.playJournalEntry.findMany({
        where,
        include: {
          game: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
              slug: true,
              genres: {
                include: { genre: true },
              },
            },
          },
        },
        orderBy: orderByClause,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.playJournalEntry.count({ where }),
    ]);

    return paginated(entries, { page, limit, total });
  } catch (err) {
    console.error('Journal list error:', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const parsed = await parseBody(req, journalEntrySchema);
    if ('error' in parsed) return parsed.error;
    const { data } = parsed;

    const existing = await db.playJournalEntry.findUnique({
      where: { userId_gameId: { userId, gameId: data.gameId } },
    });

    if (existing) {
      return conflict('This game is already in your journal');
    }

    const entry = await db.playJournalEntry.create({
      data: {
        userId,
        gameId: data.gameId,
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

    return success(entry, 201);
  } catch (err) {
    console.error('Journal create error:', err);
    return serverError();
  }
}
