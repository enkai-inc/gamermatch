import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-utils';
import { success, serverError } from '@/lib/api-response';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const [
      journalAggregates,
      recentJournal,
      recommendationsCount,
      wishlistCount,
      tasteProfile,
      topRecommendations,
      wishlistAlerts,
    ] = await Promise.all([
      db.playJournalEntry.aggregate({
        where: { userId },
        _count: true,
        _sum: { hoursPlayed: true },
        _avg: { rating: true },
      }),
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
        take: 5,
      }),
      db.recommendation.count({
        where: { userId, dismissed: false },
      }),
      db.wishlistItem.count({
        where: { userId },
      }),
      db.tasteProfile.findUnique({
        where: { userId },
        select: {
          completedAt: true,
          favoriteGenres: true,
          preferredMechanics: true,
          moodPreferences: true,
          difficultyPref: true,
          sessionLength: true,
        },
      }),
      db.recommendation.findMany({
        where: { userId, dismissed: false },
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
        orderBy: { score: 'desc' },
        take: 5,
      }),
      db.wishlistItem.findMany({
        where: { userId },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
              slug: true,
              affiliateLinks: {
                where: { onSale: true },
                select: {
                  currentPrice: true,
                  salePrice: true,
                  storefront: true,
                },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    const wishlistWithSales = wishlistAlerts
      .filter((w) => w.game.affiliateLinks.length > 0)
      .map((w) => ({
        game: {
          id: w.game.id,
          title: w.game.title,
          coverUrl: w.game.coverUrl,
          slug: w.game.slug,
        },
        currentPrice: w.game.affiliateLinks[0].currentPrice,
        salePrice: w.game.affiliateLinks[0].salePrice,
      }));

    return success({
      gamesPlayed: journalAggregates._count,
      totalHours: journalAggregates._sum.hoursPlayed ?? 0,
      averageRating: journalAggregates._avg.rating
        ? Math.round(journalAggregates._avg.rating * 10) / 10
        : 0,
      recommendationsCount,
      wishlistCount,
      profileComplete: !!tasteProfile?.completedAt,
      tasteProfile: tasteProfile
        ? {
            favoriteGenres: tasteProfile.favoriteGenres,
            preferredMechanics: tasteProfile.preferredMechanics,
            moodPreferences: tasteProfile.moodPreferences,
            difficultyPref: tasteProfile.difficultyPref,
            sessionLength: tasteProfile.sessionLength,
          }
        : null,
      recentJournal: recentJournal.map((entry) => ({
        game: entry.game,
        rating: entry.rating,
        status: entry.status,
        updatedAt: entry.updatedAt,
      })),
      topRecommendations: topRecommendations.map((rec) => ({
        game: rec.game,
        score: rec.score,
        reason: rec.reason,
      })),
      wishlistAlerts: wishlistWithSales,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return serverError();
  }
}
