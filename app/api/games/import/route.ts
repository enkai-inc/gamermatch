import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-utils';
import { importTopGames } from '@/lib/game-import';
import { success, serverError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return authResult.error;
    }

    let count = 100;
    try {
      const body = await req.json();
      if (body.count && typeof body.count === 'number') {
        count = Math.min(500, Math.max(1, body.count));
      }
    } catch {
      // Use default count if no body or invalid JSON
    }

    const imported = await importTopGames(count);

    return success({
      imported,
      note: 'This is a long-running operation. Large imports may take several minutes.',
    });
  } catch (err) {
    console.error('Game import error:', err);
    return serverError();
  }
}
