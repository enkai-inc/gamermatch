import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, parseSearchParams } from '@/lib/api-utils';
import { paginated, serverError } from '@/lib/api-response';
import { generateRecommendations } from '@/lib/recommendation-engine';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { page, limit } = parseSearchParams(req);
    const { searchParams } = new URL(req.url);
    const mood = searchParams.get('mood') || undefined;

    // Check if user has any non-dismissed recommendations
    const existingCount = await db.recommendation.count({
      where: { userId, dismissed: false },
    });

    // If no recommendations exist yet, generate them
    if (existingCount === 0) {
      await generateRecommendations(userId, { mood, limit: 50 });
    }

    // Build query
    const where: any = { userId, dismissed: false };
    if (mood) {
      where.mood = mood;
    }

    const [recommendations, total] = await Promise.all([
      db.recommendation.findMany({
        where,
        include: {
          game: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
              summary: true,
              igdbRating: true,
              releaseDate: true,
              developer: true,
              genres: {
                include: { genre: true },
              },
              platforms: {
                include: { platform: true },
              },
            },
          },
        },
        orderBy: { score: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.recommendation.count({ where }),
    ]);

    return paginated(recommendations, { page, limit, total });
  } catch (err) {
    console.error('Recommendations list error:', err);
    return serverError();
  }
}
