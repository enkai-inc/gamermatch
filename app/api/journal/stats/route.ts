import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-utils';
import { success, serverError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const [entries, aggregates] = await Promise.all([
      db.playJournalEntry.findMany({
        where: { userId },
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
        orderBy: { updatedAt: 'desc' },
      }),
      db.playJournalEntry.aggregate({
        where: { userId },
        _count: true,
        _sum: { hoursPlayed: true },
        _avg: { rating: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const entry of entries) {
      byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
    }

    const topRated = entries
      .filter((e) => e.rating !== null)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 5)
      .map((e) => ({ game: e.game, rating: e.rating }));

    const recentlyPlayed = entries
      .filter((e) => e.status === 'PLAYING' || e.status === 'COMPLETED')
      .slice(0, 5)
      .map((e) => ({ game: e.game, updatedAt: e.updatedAt }));

    return success({
      totalGames: aggregates._count,
      totalHours: aggregates._sum.hoursPlayed ?? 0,
      averageRating: aggregates._avg.rating
        ? Math.round(aggregates._avg.rating * 10) / 10
        : 0,
      byStatus,
      topRated,
      recentlyPlayed,
    });
  } catch (err) {
    console.error('Journal stats error:', err);
    return serverError();
  }
}
