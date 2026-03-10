import { db } from '@/lib/db';
import { fetchTopGames, igdbImageUrl, type IGDBGame } from '@/lib/igdb';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function upsertGenre(name: string, slug: string) {
  return db.genre.upsert({
    where: { slug },
    create: { name, slug },
    update: { name },
  });
}

async function upsertPlatform(name: string, slug: string) {
  return db.platform.upsert({
    where: { slug },
    create: { name, slug },
    update: { name },
  });
}

async function upsertTheme(name: string, slug: string) {
  return db.theme.upsert({
    where: { slug },
    create: { name, slug },
    update: { name },
  });
}

// Map IGDB keywords to our mechanics taxonomy
const MECHANIC_KEYWORDS = new Set([
  'open-world', 'turn-based-combat', 'real-time-combat', 'crafting',
  'base-building', 'stealth', 'puzzle-solving', 'deck-building',
  'resource-management', 'exploration', 'narrative-choice',
  'co-op', 'competitive-multiplayer', 'roguelike', 'metroidvania',
  'sandbox', 'survival', 'platforming', 'shooter', 'hack-and-slash',
]);

async function upsertMechanic(name: string, slug: string) {
  return db.mechanic.upsert({
    where: { slug },
    create: { name, slug },
    update: { name },
  });
}

export async function importGame(igdbGame: IGDBGame) {
  const slug = igdbGame.slug || slugify(igdbGame.name);

  // Find developer and publisher
  const developer = igdbGame.involved_companies?.find(c => c.developer)?.company.name;
  const publisher = igdbGame.involved_companies?.find(c => c.publisher)?.company.name;

  // Cover URL
  const coverUrl = igdbGame.cover?.image_id
    ? igdbImageUrl(igdbGame.cover.image_id, 'cover_big')
    : null;

  // Screenshots
  const screenshotUrls = igdbGame.screenshots?.map(s => igdbImageUrl(s.image_id, 'screenshot_big')) || [];

  // Upsert the game
  const game = await db.game.upsert({
    where: { igdbId: igdbGame.id },
    create: {
      igdbId: igdbGame.id,
      title: igdbGame.name,
      slug,
      description: igdbGame.storyline || igdbGame.summary || null,
      summary: igdbGame.summary || null,
      coverUrl,
      screenshotUrls,
      releaseDate: igdbGame.first_release_date
        ? new Date(igdbGame.first_release_date * 1000)
        : null,
      developer,
      publisher,
      igdbRating: igdbGame.total_rating ? Math.round(igdbGame.total_rating) / 10 : null,
      metacriticScore: igdbGame.aggregated_rating ? Math.round(igdbGame.aggregated_rating) : null,
    },
    update: {
      title: igdbGame.name,
      description: igdbGame.storyline || igdbGame.summary || null,
      summary: igdbGame.summary || null,
      coverUrl,
      screenshotUrls,
      developer,
      publisher,
      igdbRating: igdbGame.total_rating ? Math.round(igdbGame.total_rating) / 10 : null,
      metacriticScore: igdbGame.aggregated_rating ? Math.round(igdbGame.aggregated_rating) : null,
    },
  });

  // Upsert genres and link
  if (igdbGame.genres) {
    for (const g of igdbGame.genres) {
      const genre = await upsertGenre(g.name, g.slug);
      await db.gameGenre.upsert({
        where: { gameId_genreId: { gameId: game.id, genreId: genre.id } },
        create: { gameId: game.id, genreId: genre.id },
        update: {},
      });
    }
  }

  // Upsert platforms and link
  if (igdbGame.platforms) {
    for (const p of igdbGame.platforms) {
      const platform = await upsertPlatform(p.name, p.slug);
      await db.gamePlatform.upsert({
        where: { gameId_platformId: { gameId: game.id, platformId: platform.id } },
        create: { gameId: game.id, platformId: platform.id },
        update: {},
      });
    }
  }

  // Upsert themes and link
  if (igdbGame.themes) {
    for (const t of igdbGame.themes) {
      const theme = await upsertTheme(t.name, t.slug);
      await db.gameTheme.upsert({
        where: { gameId_themeId: { gameId: game.id, themeId: theme.id } },
        create: { gameId: game.id, themeId: theme.id },
        update: {},
      });
    }
  }

  // Extract mechanics from keywords
  if (igdbGame.keywords) {
    for (const k of igdbGame.keywords) {
      if (MECHANIC_KEYWORDS.has(k.slug)) {
        const mechanic = await upsertMechanic(k.name, k.slug);
        await db.gameMechanic.upsert({
          where: { gameId_mechanicId: { gameId: game.id, mechanicId: mechanic.id } },
          create: { gameId: game.id, mechanicId: mechanic.id },
          update: {},
        });
      }
    }
  }

  return game;
}

export async function importTopGames(count = 500) {
  const batchSize = 100;
  let imported = 0;

  for (let offset = 0; offset < count; offset += batchSize) {
    const limit = Math.min(batchSize, count - offset);
    console.log(`Fetching games ${offset + 1}-${offset + limit}...`);

    const games = await fetchTopGames(limit, offset);

    for (const game of games) {
      try {
        await importGame(game);
        imported++;
      } catch (err) {
        console.error(`Failed to import ${game.name}:`, err);
      }
    }

    // Rate limit: 4 req/sec for IGDB
    if (offset + batchSize < count) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`Imported ${imported} games.`);
  return imported;
}
