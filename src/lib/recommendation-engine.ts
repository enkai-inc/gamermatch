import { db } from '@/lib/db';
import { cosineSimilarity, compareDna } from '@/lib/game-dna';

// Mechanic and theme dimension constants (must match game-dna.ts)
const MECHANIC_DIMENSIONS = [
  'open-world', 'turn-based-combat', 'real-time-combat', 'crafting',
  'base-building', 'stealth', 'puzzle-solving', 'deck-building',
  'resource-management', 'exploration', 'narrative-choice',
  'co-op', 'competitive-multiplayer', 'roguelike', 'metroidvania',
  'sandbox', 'survival', 'platforming', 'shooter', 'hack-and-slash',
];

const THEME_DIMENSIONS = [
  'fantasy', 'science-fiction', 'horror', 'post-apocalyptic',
  'historical', 'cyberpunk', 'mythology', 'romance',
  'military', 'space', 'nature', 'urban', 'comedy', 'drama',
  'mystery', 'western', 'steampunk', 'supernatural',
];

interface ScoredGame {
  gameId: string;
  score: number;
  reason: string;
  source: 'AI_ENGINE' | 'GAME_DNA' | 'MOOD' | 'COMMUNITY' | 'TRENDING';
}

// Build a preference vector from a taste profile
function buildPreferenceVectors(profile: any) {
  // Mechanics vector from preferred mechanics
  const preferredMechanics = (profile.preferredMechanics || []) as string[];
  const mechanicsVector = MECHANIC_DIMENSIONS.map(dim =>
    preferredMechanics.some(m => m.toLowerCase().replace(/\s+/g, '-') === dim) ? 1.0 : 0.0
  );

  // Build a genre preference set
  const favoriteGenres = new Set((profile.favoriteGenres || []) as string[]);

  // Mood preferences
  const moodPreferences = (profile.moodPreferences || {}) as Record<string, number>;

  return { mechanicsVector, favoriteGenres, moodPreferences };
}

// Score how well a game matches a taste profile
function scoreProfileMatch(
  game: any,
  gameDna: any,
  prefs: ReturnType<typeof buildPreferenceVectors>,
  profile: any
): number {
  let score = 0;
  let weights = 0;

  // Genre overlap (0-1)
  const gameGenres = game.genres?.map((g: any) => g.genre?.name || g.name) || [];
  if (prefs.favoriteGenres.size > 0 && gameGenres.length > 0) {
    const overlap = gameGenres.filter((g: string) => prefs.favoriteGenres.has(g)).length;
    score += (overlap / Math.max(prefs.favoriteGenres.size, 1)) * 0.35;
    weights += 0.35;
  }

  // Mechanics similarity (cosine)
  if (gameDna?.mechanicsVector) {
    const mechSim = cosineSimilarity(prefs.mechanicsVector, gameDna.mechanicsVector as number[]);
    score += mechSim * 0.25;
    weights += 0.25;
  }

  // Difficulty match
  if (profile.difficultyPref && gameDna) {
    const difficultyMap: Record<string, number> = {
      'CASUAL': 0.25, 'MODERATE': 0.5, 'CHALLENGING': 0.75, 'HARDCORE': 1.0,
    };
    const prefDiff = difficultyMap[profile.difficultyPref] || 0.5;
    const gameDiff = (gameDna.complexityScore as number) || 0.5;
    const diffMatch = 1 - Math.abs(prefDiff - gameDiff);
    score += diffMatch * 0.15;
    weights += 0.15;
  }

  // Pacing match based on session length preference
  if (profile.sessionLength && gameDna) {
    const sessionPacing: Record<string, number> = {
      'QUICK': 0.8, 'MEDIUM': 0.5, 'LONG': 0.3, 'MARATHON': 0.2,
    };
    const prefPacing = sessionPacing[profile.sessionLength] || 0.5;
    const gamePacing = (gameDna.pacingScore as number) || 0.5;
    const paceMatch = 1 - Math.abs(prefPacing - gamePacing) * 0.5;
    score += paceMatch * 0.10;
    weights += 0.10;
  }

  // Popularity baseline
  if (game.igdbRating) {
    score += ((game.igdbRating as number) / 10) * 0.10;
    weights += 0.10;
  }

  // Freshness bonus (newer games get slight boost)
  if (game.releaseDate) {
    const ageYears = (Date.now() - new Date(game.releaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const freshness = Math.max(0, 1 - ageYears / 10); // decays over 10 years
    score += freshness * 0.05;
    weights += 0.05;
  }

  return weights > 0 ? score / weights : 0;
}

// Generate a human-readable reason
function generateReason(game: any, gameDna: any, prefs: ReturnType<typeof buildPreferenceVectors>, _score: number): string {
  const reasons: string[] = [];

  const gameGenres = game.genres?.map((g: any) => g.genre?.name || g.name) || [];
  const matchingGenres = gameGenres.filter((g: string) => prefs.favoriteGenres.has(g));

  if (matchingGenres.length > 0) {
    reasons.push(`Matches your love for ${matchingGenres.slice(0, 2).join(' and ')}`);
  }

  if (gameDna) {
    if ((gameDna.pacingScore as number) > 0.7) reasons.push('Fast-paced action');
    if ((gameDna.pacingScore as number) < 0.3) reasons.push('Relaxed, methodical gameplay');
    if ((gameDna.complexityScore as number) > 0.7) reasons.push('Deep strategic depth');
    if ((gameDna.socialScore as number) > 0.6) reasons.push('Great multiplayer experience');
  }

  if (game.igdbRating && (game.igdbRating as number) > 8) {
    reasons.push('Critically acclaimed');
  }

  if (reasons.length === 0) {
    reasons.push('Recommended based on your taste profile');
  }

  return reasons.slice(0, 3).join('. ');
}

// Suppress unused variable warnings for constants reserved for future use
void THEME_DIMENSIONS;

export async function generateRecommendations(userId: string, options?: { mood?: string; limit?: number }) {
  const limit = options?.limit || 50;

  // Get user's taste profile
  const profile = await db.tasteProfile.findUnique({ where: { userId } });
  if (!profile || !profile.completedAt) {
    return { recommendations: [], message: 'Complete your taste profile first' };
  }

  const prefs = buildPreferenceVectors(profile);

  // Get games already in journal or dismissed
  const [journalEntries, dismissedRecs] = await Promise.all([
    db.playJournalEntry.findMany({
      where: { userId },
      select: { gameId: true, rating: true },
    }),
    db.recommendation.findMany({
      where: { userId, dismissed: true },
      select: { gameId: true },
    }),
  ]);

  const excludeGameIds = new Set([
    ...journalEntries.map(e => e.gameId),
    ...dismissedRecs.map(r => r.gameId),
  ]);

  // Behavioral boost: get highly rated games from journal for DNA comparison
  const lovedGames = journalEntries
    .filter(e => e.rating && e.rating >= 8)
    .map(e => e.gameId);

  const lovedDna = lovedGames.length > 0
    ? await db.gameDna.findMany({ where: { gameId: { in: lovedGames } } })
    : [];

  // Fetch candidate games with DNA
  const candidateWhere: any = {
    id: { notIn: Array.from(excludeGameIds) },
    gameDna: { isNot: null },
  };

  // Mood filter
  if (options?.mood) {
    candidateWhere.gameDna = {
      ...candidateWhere.gameDna,
      moodTags: { array_contains: [options.mood] },
    };
  }

  const candidates = await db.game.findMany({
    where: candidateWhere,
    include: {
      genres: { include: { genre: true } },
      platforms: { include: { platform: true } },
      gameDna: true,
    },
    take: 500, // Score top 500 candidates
  });

  // Score each candidate
  const scored: ScoredGame[] = candidates.map(game => {
    let profileScore = scoreProfileMatch(game, game.gameDna, prefs, profile);

    // Behavioral boost from loved games
    if (lovedDna.length > 0 && game.gameDna) {
      const dnaScores = lovedDna.map(ld => compareDna(ld, game.gameDna!));
      const avgDnaSim = dnaScores.reduce((a, b) => a + b, 0) / dnaScores.length;
      profileScore = profileScore * 0.65 + avgDnaSim * 0.35;
    }

    return {
      gameId: game.id,
      score: Math.min(1, Math.max(0, profileScore)),
      reason: generateReason(game, game.gameDna, prefs, profileScore),
      source: (options?.mood ? 'MOOD' : lovedDna.length > 0 ? 'GAME_DNA' : 'AI_ENGINE') as ScoredGame['source'],
    };
  });

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);
  const topRecs = scored.slice(0, limit);

  // Upsert recommendations in database
  for (const rec of topRecs) {
    await db.recommendation.upsert({
      where: { userId_gameId: { userId, gameId: rec.gameId } },
      create: {
        userId,
        gameId: rec.gameId,
        score: rec.score,
        reason: rec.reason,
        source: rec.source,
        mood: options?.mood as any || null,
      },
      update: {
        score: rec.score,
        reason: rec.reason,
        source: rec.source,
        mood: options?.mood as any || null,
      },
    });
  }

  return { recommendations: topRecs, total: topRecs.length };
}
