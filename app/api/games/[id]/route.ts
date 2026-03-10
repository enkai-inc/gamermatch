import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, notFound, serverError } from '@/lib/api-response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await db.game.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
        mechanics: { include: { mechanic: true } },
        themes: { include: { theme: true } },
        gameDna: true,
      },
    });

    if (!game) {
      return notFound('Game');
    }

    const data = {
      id: game.id,
      igdbId: game.igdbId,
      title: game.title,
      slug: game.slug,
      description: game.description,
      summary: game.summary,
      coverUrl: game.coverUrl,
      screenshotUrls: game.screenshotUrls,
      releaseDate: game.releaseDate,
      developer: game.developer,
      publisher: game.publisher,
      metacriticScore: game.metacriticScore,
      igdbRating: game.igdbRating,
      genres: game.genres.map(g => ({ name: g.genre.name, slug: g.genre.slug })),
      platforms: game.platforms.map(p => ({ name: p.platform.name, slug: p.platform.slug })),
      mechanics: game.mechanics.map(m => ({ name: m.mechanic.name, slug: m.mechanic.slug })),
      themes: game.themes.map(t => ({ name: t.theme.name, slug: t.theme.slug })),
      gameDna: game.gameDna,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };

    return success(data);
  } catch (err) {
    console.error('Game detail error:', err);
    return serverError();
  }
}
