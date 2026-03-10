import { db } from '@/lib/db';
import { Storefront } from '@prisma/client';

// Affiliate URL templates with tag placeholders
const AFFILIATE_CONFIGS: Record<string, { urlTemplate: string; hasAffiliate: boolean; displayName: string; color: string }> = {
  STEAM: { urlTemplate: 'https://store.steampowered.com/app/{steamAppId}', hasAffiliate: false, displayName: 'Steam', color: '#1b2838' },
  HUMBLE_BUNDLE: { urlTemplate: 'https://www.humblebundle.com/store/{slug}?partner=gamematch', hasAffiliate: true, displayName: 'Humble Bundle', color: '#cc2929' },
  GREEN_MAN_GAMING: { urlTemplate: 'https://www.greenmangaming.com/games/{slug}?tap_a=gamematch', hasAffiliate: true, displayName: 'Green Man Gaming', color: '#01a84e' },
  CDKEYS: { urlTemplate: 'https://www.cdkeys.com/{slug}?ref=gamematch', hasAffiliate: true, displayName: 'CDKeys', color: '#e8450e' },
  GOG: { urlTemplate: 'https://www.gog.com/game/{slug}?pp=gamematch', hasAffiliate: true, displayName: 'GOG', color: '#86328a' },
  EPIC_GAMES: { urlTemplate: 'https://store.epicgames.com/p/{slug}', hasAffiliate: false, displayName: 'Epic Games', color: '#2a2a2a' },
  GAMESTOP: { urlTemplate: 'https://www.gamestop.com/search/?q={title}', hasAffiliate: true, displayName: 'GameStop', color: '#e31837' },
  BIG_FISH: { urlTemplate: 'https://www.bigfishgames.com/games/{slug}?ref=gamematch', hasAffiliate: true, displayName: 'Big Fish Games', color: '#0099cc' },
  PLAYSTATION: { urlTemplate: 'https://store.playstation.com/search/{title}', hasAffiliate: false, displayName: 'PlayStation', color: '#003087' },
  XBOX: { urlTemplate: 'https://www.xbox.com/games/store/{slug}', hasAffiliate: false, displayName: 'Xbox', color: '#107c10' },
  NINTENDO: { urlTemplate: 'https://www.nintendo.com/store/products/{slug}', hasAffiliate: false, displayName: 'Nintendo', color: '#e60012' },
};

export function getStoreConfig(storefront: string) {
  return AFFILIATE_CONFIGS[storefront] || null;
}

export function getAllStoreConfigs() {
  return AFFILIATE_CONFIGS;
}

export function buildAffiliateUrl(storefront: string, game: { slug: string; title: string; steamAppId?: number | null }): string {
  const config = AFFILIATE_CONFIGS[storefront];
  if (!config) return '#';
  return config.urlTemplate
    .replace('{slug}', game.slug)
    .replace('{title}', encodeURIComponent(game.title))
    .replace('{steamAppId}', String(game.steamAppId || ''));
}

export async function getGamePrices(gameId: string) {
  return db.affiliateLink.findMany({
    where: { gameId },
    orderBy: { currentPrice: 'asc' },
  });
}

export async function trackClick(affiliateLinkId: string, userId: string | null, storefront: Storefront, gameId: string) {
  return db.affiliateClick.create({
    data: { affiliateLinkId, userId, storefront, gameId },
  });
}
