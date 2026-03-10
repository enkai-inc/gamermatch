import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { searchGames } from '@/lib/igdb';
import { importGame } from '@/lib/game-import';
import { success, error, serverError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    if (!query.trim()) {
      return error('VALIDATION_ERROR', 'Search query "q" is required', 400);
    }

    // Search local database first
    const localGames = await db.game.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        releaseDate: true,
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
      },
      take: limit,
    });

    // If we have enough local results, return them
    if (localGames.length >= limit) {
      const data = localGames.map(g => ({
        id: g.id,
        title: g.title,
        slug: g.slug,
        coverUrl: g.coverUrl,
        releaseDate: g.releaseDate,
        genres: g.genres.map(gg => ({ name: gg.genre.name, slug: gg.genre.slug })),
        platforms: g.platforms.map(gp => ({ name: gp.platform.name, slug: gp.platform.slug })),
      }));
      return success(data);
    }

    // Fall back to IGDB search and import on-the-fly
    const remaining = limit - localGames.length;
    const localIgdbIds = new Set(
      (await db.game.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        select: { igdbId: true },
      })).map(g => g.igdbId).filter(Boolean)
    );

    const igdbGames = await searchGames(query, remaining + 5); // fetch extra to account for dupes
    const imported = [];

    for (const igdbGame of igdbGames) {
      if (localIgdbIds.has(igdbGame.id)) continue;
      if (imported.length >= remaining) break;

      try {
        const game = await importGame(igdbGame);
        const full = await db.game.findUnique({
          where: { id: game.id },
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            releaseDate: true,
            genres: { include: { genre: true } },
            platforms: { include: { platform: true } },
          },
        });
        if (full) imported.push(full);
      } catch {
        // Skip failed imports silently
      }
    }

    const allGames = [...localGames, ...imported].slice(0, limit);
    const data = allGames.map(g => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      coverUrl: g.coverUrl,
      releaseDate: g.releaseDate,
      genres: g.genres.map(gg => ({ name: gg.genre.name, slug: gg.genre.slug })),
      platforms: g.platforms.map(gp => ({ name: gp.platform.name, slug: gp.platform.slug })),
    }));

    return success(data);
  } catch (err) {
    console.error('Game search error:', err);
    return serverError();
  }
}
