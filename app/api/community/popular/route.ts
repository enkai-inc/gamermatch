import { NextRequest } from 'next/server';
import { success, serverError } from '@/lib/api-response';
import { getClusterPopularGames, getAllClusters } from '@/lib/taste-clusters';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clusterId = searchParams.get('cluster');

    if (!clusterId) {
      // Return all clusters if no specific cluster requested
      const clusters = getAllClusters();
      return success({ clusters });
    }

    const games = await getClusterPopularGames(clusterId, 20);
    return success({ clusterId, games });
  } catch (err) {
    console.error('Community popular games error:', err);
    return serverError();
  }
}
