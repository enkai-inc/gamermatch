import { requireAuth } from '@/lib/api-utils';
import { success, serverError } from '@/lib/api-response';
import { generateRecommendations } from '@/lib/recommendation-engine';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const result = await generateRecommendations(userId, { limit: 50 });

    return success({
      total: result.total,
      message: result.recommendations.length > 0
        ? `Generated ${result.total} recommendations`
        : result.message || 'No recommendations generated',
    });
  } catch (err) {
    console.error('Recommendation refresh error:', err);
    return serverError();
  }
}
