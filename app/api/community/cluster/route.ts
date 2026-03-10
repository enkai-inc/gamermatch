import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-utils';
import { success, notFound, serverError } from '@/lib/api-response';
import { assignCluster, getClusterInfo, getClusterPopularGames } from '@/lib/taste-clusters';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    // Get user's taste profile
    const profile = await db.tasteProfile.findUnique({
      where: { userId },
    });

    if (!profile?.completedAt) {
      return notFound('Completed taste profile');
    }

    // Assign cluster based on profile
    const favoriteGenres = (profile.favoriteGenres as string[]) || [];
    const difficultyPref = (profile.difficultyPref as string) || null;
    const clusterId = assignCluster(favoriteGenres, difficultyPref);
    const clusterInfo = getClusterInfo(clusterId);

    if (!clusterInfo) {
      return notFound('Cluster');
    }

    // Get popular games in this cluster
    const popularGames = await getClusterPopularGames(clusterId, 10);

    return success({
      cluster: clusterInfo,
      popularGames,
    });
  } catch (err) {
    console.error('Community cluster error:', err);
    return serverError();
  }
}
