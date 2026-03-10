import { db } from '@/lib/db';

// Mechanic dimension mapping: mechanic slug -> vector index
const MECHANIC_DIMENSIONS = [
  'open-world', 'turn-based-combat', 'real-time-combat', 'crafting',
  'base-building', 'stealth', 'puzzle-solving', 'deck-building',
  'resource-management', 'exploration', 'narrative-choice',
  'co-op', 'competitive-multiplayer', 'roguelike', 'metroidvania',
  'sandbox', 'survival', 'platforming', 'shooter', 'hack-and-slash',
] as const;

// Theme dimension mapping
const THEME_DIMENSIONS = [
  'fantasy', 'science-fiction', 'horror', 'post-apocalyptic',
  'historical', 'cyberpunk', 'mythology', 'romance',
  'military', 'space', 'nature', 'urban', 'comedy', 'drama',
  'mystery', 'western', 'steampunk', 'supernatural',
] as const;

// Genre -> pacing score mapping (0 = very slow, 1 = very fast)
const GENRE_PACING: Record<string, number> = {
  'turn-based-strategy': 0.2, 'puzzle': 0.3, 'adventure': 0.4,
  'role-playing-rpg': 0.4, 'strategy': 0.3, 'simulation': 0.3,
  'visual-novel': 0.2, 'platformer': 0.7, 'shooter': 0.9,
  'fighting': 0.9, 'racing': 0.8, 'sport': 0.7,
  'hack-and-slash-beat-em-up': 0.8, 'arcade': 0.8,
  'real-time-strategy-rts': 0.6, 'moba': 0.8,
  'tactical': 0.4, 'indie': 0.5, 'point-and-click': 0.2,
};

// Genre -> complexity score mapping
const GENRE_COMPLEXITY: Record<string, number> = {
  'arcade': 0.2, 'platformer': 0.3, 'puzzle': 0.5,
  'shooter': 0.3, 'fighting': 0.4, 'racing': 0.3,
  'adventure': 0.4, 'role-playing-rpg': 0.7, 'strategy': 0.8,
  'simulation': 0.7, 'turn-based-strategy': 0.8,
  'real-time-strategy-rts': 0.8, 'moba': 0.6,
  'tactical': 0.7, 'visual-novel': 0.2, 'sport': 0.3,
  'hack-and-slash-beat-em-up': 0.4, 'indie': 0.5,
};

// Game mode -> social score
const MODE_SOCIAL: Record<string, number> = {
  'single-player': 0.1, 'multiplayer': 0.7,
  'co-operative': 0.6, 'split-screen': 0.5,
  'massively-multiplayer-online-mmo': 0.9,
  'battle-royale': 0.8,
};

// Genre -> aesthetic tags mapping
const GENRE_AESTHETICS: Record<string, string[]> = {
  'role-playing-rpg': ['epic', 'detailed', 'immersive'],
  'platformer': ['colorful', 'dynamic', 'retro'],
  'horror': ['dark', 'atmospheric', 'unsettling'],
  'shooter': ['intense', 'gritty', 'action-packed'],
  'puzzle': ['clean', 'minimalist', 'cerebral'],
  'simulation': ['detailed', 'systematic', 'realistic'],
  'adventure': ['scenic', 'exploratory', 'narrative'],
  'strategy': ['overhead', 'tactical', 'complex'],
  'indie': ['artistic', 'unique', 'experimental'],
  'visual-novel': ['illustrated', 'character-focused', 'narrative'],
};

// Genre -> mood tags
const GENRE_MOODS: Record<string, string[]> = {
  'role-playing-rpg': ['ADVENTURE', 'RELAXING'],
  'platformer': ['QUICK_FUN', 'COMPETITIVE'],
  'horror': ['ADVENTURE'],
  'shooter': ['COMPETITIVE', 'QUICK_FUN'],
  'puzzle': ['RELAXING', 'CREATIVE'],
  'simulation': ['RELAXING', 'CREATIVE'],
  'adventure': ['ADVENTURE', 'RELAXING'],
  'strategy': ['COMPETITIVE', 'CREATIVE'],
  'fighting': ['COMPETITIVE', 'QUICK_FUN'],
  'racing': ['COMPETITIVE', 'QUICK_FUN'],
  'sport': ['COMPETITIVE', 'SOCIAL'],
  'moba': ['COMPETITIVE', 'SOCIAL'],
};

// Genre -> emotional tone
const GENRE_EMOTIONS: Record<string, string[]> = {
  'horror': ['tense', 'dread', 'shock'],
  'adventure': ['wonder', 'curiosity', 'excitement'],
  'role-playing-rpg': ['epic', 'investment', 'growth'],
  'puzzle': ['satisfaction', 'eureka', 'focus'],
  'simulation': ['zen', 'accomplishment', 'mastery'],
  'platformer': ['joy', 'frustration', 'triumph'],
  'shooter': ['adrenaline', 'tension', 'victory'],
  'strategy': ['planning', 'satisfaction', 'dominance'],
  'visual-novel': ['empathy', 'curiosity', 'emotion'],
};

// Suppress unused variable warning — MODE_SOCIAL reserved for future game mode integration
void MODE_SOCIAL;

function buildMechanicsVector(mechanicSlugs: string[]): number[] {
  return MECHANIC_DIMENSIONS.map(dim =>
    mechanicSlugs.includes(dim) ? 1.0 : 0.0
  );
}

function buildThemesVector(themeSlugs: string[]): number[] {
  return THEME_DIMENSIONS.map(dim =>
    themeSlugs.includes(dim) ? 1.0 : 0.0
  );
}

function avgScore(genreSlugs: string[], mapping: Record<string, number>, fallback: number): number {
  const scores = genreSlugs.map(g => mapping[g]).filter((s): s is number => s !== undefined);
  if (scores.length === 0) return fallback;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function collectTags(genreSlugs: string[], mapping: Record<string, string[]>): string[] {
  const tags = new Set<string>();
  for (const slug of genreSlugs) {
    const items = mapping[slug];
    if (items) items.forEach(t => tags.add(t));
  }
  return Array.from(tags);
}

export async function extractGameDna(gameId: string) {
  const game = await db.game.findUnique({
    where: { id: gameId },
    include: {
      genres: { include: { genre: true } },
      mechanics: { include: { mechanic: true } },
      themes: { include: { theme: true } },
      platforms: { include: { platform: true } },
    },
  });

  if (!game) throw new Error(`Game not found: ${gameId}`);

  const genreSlugs = game.genres.map(g => g.genre.slug);
  const mechanicSlugs = game.mechanics.map(m => m.mechanic.slug);
  const themeSlugs = game.themes.map(t => t.theme.slug);

  const dna = {
    mechanicsVector: buildMechanicsVector(mechanicSlugs),
    themesVector: buildThemesVector(themeSlugs),
    pacingScore: avgScore(genreSlugs, GENRE_PACING, 0.5),
    complexityScore: avgScore(genreSlugs, GENRE_COMPLEXITY, 0.5),
    socialScore: 0.3, // Default moderate; will be refined with game mode data
    aestheticTags: collectTags(genreSlugs, GENRE_AESTHETICS),
    emotionalTone: collectTags(genreSlugs, GENRE_EMOTIONS),
    moodTags: collectTags(genreSlugs, GENRE_MOODS),
  };

  return db.gameDna.upsert({
    where: { gameId },
    create: { gameId, ...dna },
    update: dna,
  });
}

export async function extractAllGameDna() {
  const games = await db.game.findMany({ select: { id: true, title: true } });
  let processed = 0;
  let failed = 0;

  for (const game of games) {
    try {
      await extractGameDna(game.id);
      processed++;
    } catch (err) {
      console.error(`Failed DNA extraction for ${game.title}:`, err);
      failed++;
    }
  }

  return { processed, failed, total: games.length };
}

// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Compare two games' DNA similarity (0-1)
export function compareDna(dnaA: Record<string, unknown>, dnaB: Record<string, unknown>): number {
  const mechSim = cosineSimilarity(
    dnaA.mechanicsVector as number[],
    dnaB.mechanicsVector as number[]
  );
  const themeSim = cosineSimilarity(
    dnaA.themesVector as number[],
    dnaB.themesVector as number[]
  );
  const pacingDiff = 1 - Math.abs((dnaA.pacingScore as number) - (dnaB.pacingScore as number));
  const complexDiff = 1 - Math.abs((dnaA.complexityScore as number) - (dnaB.complexityScore as number));
  const socialDiff = 1 - Math.abs((dnaA.socialScore as number) - (dnaB.socialScore as number));

  // Weighted combination
  return (
    mechSim * 0.30 +
    themeSim * 0.25 +
    pacingDiff * 0.20 +
    complexDiff * 0.15 +
    socialDiff * 0.10
  );
}
