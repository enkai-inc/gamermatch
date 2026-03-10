import { db } from '@/lib/db';

// Simple k-means-inspired clustering on taste profiles
// For MVP: cluster by dominant genre + difficulty combo

interface ClusterInfo {
  clusterId: string;
  name: string;
  description: string;
  memberCount: number;
}

// Predefined cluster archetypes based on genre + difficulty combos
const CLUSTER_ARCHETYPES: Record<string, { name: string; description: string; genres: string[] }> = {
  'hardcore-rpg': { name: 'Hardcore Adventurers', description: 'Deep RPGs, challenging combat, 100+ hour journeys', genres: ['RPG', 'Adventure'] },
  'competitive-fps': { name: 'Sharpshooters', description: 'Competitive shooters, fast reflexes, ranked grinders', genres: ['FPS', 'Shooter'] },
  'strategy-minds': { name: 'Strategy Minds', description: 'Turn-based thinkers, grand strategists, 4X conquerors', genres: ['Strategy', 'Simulation'] },
  'indie-explorers': { name: 'Indie Explorers', description: 'Hidden gems, artistic games, unique experiences', genres: ['Platformer', 'Puzzle', 'Roguelike'] },
  'casual-vibes': { name: 'Casual Vibes', description: 'Relaxing gameplay, cozy games, stress-free sessions', genres: ['Simulation', 'Puzzle', 'Sandbox'] },
  'horror-fans': { name: 'Horror Enthusiasts', description: 'Thrill seekers, survival horror, psychological terror', genres: ['Horror'] },
  'social-gamers': { name: 'Social Butterflies', description: 'Co-op lovers, party games, MMO communities', genres: ['MOBA', 'Battle Royale', 'Sports'] },
  'story-lovers': { name: 'Narrative Seekers', description: 'Story-driven games, visual novels, choice matters', genres: ['Visual Novel', 'Adventure'] },
};

export function assignCluster(favoriteGenres: string[], _difficultyPref: string | null): string {
  // Score each archetype by genre overlap
  let bestCluster = 'casual-vibes';
  let bestScore = 0;

  for (const [id, archetype] of Object.entries(CLUSTER_ARCHETYPES)) {
    const overlap = favoriteGenres.filter(g => archetype.genres.includes(g)).length;
    const score = overlap / Math.max(archetype.genres.length, 1);
    if (score > bestScore) {
      bestScore = score;
      bestCluster = id;
    }
  }

  return bestCluster;
}

export function getClusterInfo(clusterId: string): ClusterInfo | null {
  const archetype = CLUSTER_ARCHETYPES[clusterId];
  if (!archetype) return null;
  return {
    clusterId,
    name: archetype.name,
    description: archetype.description,
    memberCount: 0, // filled at query time
  };
}

export function getAllClusters() {
  return Object.entries(CLUSTER_ARCHETYPES).map(([id, a]) => ({
    clusterId: id,
    name: a.name,
    description: a.description,
  }));
}

export async function getClusterPopularGames(clusterId: string, limit = 10) {
  const archetype = CLUSTER_ARCHETYPES[clusterId];
  if (!archetype) return [];

  // Find games that match this cluster's genres and are highly rated
  const games = await db.game.findMany({
    where: {
      genres: {
        some: {
          genre: {
            name: { in: archetype.genres },
          },
        },
      },
    },
    include: {
      genres: { include: { genre: true } },
      platforms: { include: { platform: true } },
    },
    orderBy: { igdbRating: 'desc' },
    take: limit,
  });

  return games;
}

export function calculateCompatibility(profileA: Record<string, unknown>, profileB: Record<string, unknown>): number {
  const genresA = new Set((profileA.favoriteGenres || []) as string[]);
  const genresB = new Set((profileB.favoriteGenres || []) as string[]);

  // Genre overlap (Jaccard similarity)
  const intersection = [...genresA].filter(g => genresB.has(g)).length;
  const union = new Set([...genresA, ...genresB]).size;
  const genreScore = union > 0 ? intersection / union : 0;

  // Difficulty match
  const diffMatch = profileA.difficultyPref === profileB.difficultyPref ? 1 : 0.5;

  // Session length match
  const sessionMatch = profileA.sessionLength === profileB.sessionLength ? 1 : 0.5;

  return genreScore * 0.6 + diffMatch * 0.2 + sessionMatch * 0.2;
}
