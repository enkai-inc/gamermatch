const IGDB_BASE_URL = 'https://api.igdb.com/v4';

interface IGDBAuth {
  access_token: string;
  expires_at: number;
}

let cachedAuth: IGDBAuth | null = null;

async function getAuth(): Promise<IGDBAuth> {
  if (cachedAuth && cachedAuth.expires_at > Date.now()) {
    return cachedAuth;
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  );

  if (!res.ok) throw new Error('Failed to authenticate with IGDB');

  const data = await res.json();
  cachedAuth = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000) - 60000, // 1min buffer
  };
  return cachedAuth;
}

export async function igdbQuery(endpoint: string, body: string): Promise<any[]> {
  const auth = await getAuth();
  const res = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID!,
      'Authorization': `Bearer ${auth.access_token}`,
      'Content-Type': 'text/plain',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB API error: ${res.status} ${text}`);
  }

  return res.json();
}

export interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  cover?: { image_id: string };
  screenshots?: { image_id: string }[];
  first_release_date?: number;
  genres?: { name: string; slug: string }[];
  platforms?: { name: string; slug: string }[];
  themes?: { name: string; slug: string }[];
  game_modes?: { name: string }[];
  keywords?: { name: string; slug: string }[];
  involved_companies?: { company: { name: string }; developer: boolean; publisher: boolean }[];
  aggregated_rating?: number;
  total_rating?: number;
}

export function igdbImageUrl(imageId: string, size: 'cover_big' | 'screenshot_big' | 'thumb' = 'cover_big'): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

export async function fetchTopGames(limit = 100, offset = 0): Promise<IGDBGame[]> {
  return igdbQuery('games', `
    fields name, slug, summary, storyline,
      cover.image_id, screenshots.image_id,
      first_release_date, genres.name, genres.slug,
      platforms.name, platforms.slug,
      themes.name, themes.slug,
      game_modes.name, keywords.name, keywords.slug,
      involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
      aggregated_rating, total_rating;
    where total_rating_count > 20 & cover != null & summary != null;
    sort total_rating desc;
    limit ${limit};
    offset ${offset};
  `);
}

export async function searchGames(query: string, limit = 10): Promise<IGDBGame[]> {
  return igdbQuery('games', `
    search "${query.replace(/"/g, '\\"')}";
    fields name, slug, summary, cover.image_id, first_release_date,
      genres.name, genres.slug, platforms.name, platforms.slug;
    where cover != null;
    limit ${limit};
  `);
}
