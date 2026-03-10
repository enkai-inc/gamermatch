import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { extractGameDna } from '@/lib/game-dna';
import { success, notFound, serverError } from '@/lib/api-response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await db.game.findUnique({ where: { id } });
    if (!game) {
      return notFound('Game');
    }

    // Check if DNA already exists
    let dna = await db.gameDna.findUnique({ where: { gameId: id } });

    // If not yet extracted, extract on-the-fly
    if (!dna) {
      dna = await extractGameDna(id);
    }

    return success(dna);
  } catch (err) {
    console.error('Game DNA error:', err);
    return serverError();
  }
}
