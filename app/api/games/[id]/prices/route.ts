import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, notFound, serverError } from '@/lib/api-response';
import { getStoreConfig, buildAffiliateUrl } from '@/lib/affiliate';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await db.game.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, steamAppId: true },
    });

    if (!game) {
      return notFound('Game');
    }

    const affiliateLinks = await db.affiliateLink.findMany({
      where: { gameId: id },
      orderBy: { currentPrice: 'asc' },
    });

    // Find the cheapest price for "best price" badge
    const cheapestPrice = affiliateLinks.reduce<number | null>((min, link) => {
      const price = link.onSale && link.salePrice != null ? link.salePrice : link.currentPrice;
      if (price == null) return min;
      return min == null ? price : Math.min(min, price);
    }, null);

    const prices = affiliateLinks.map((link) => {
      const storeConfig = getStoreConfig(link.storefront);
      const effectivePrice = link.onSale && link.salePrice != null ? link.salePrice : link.currentPrice;
      const isBestPrice = effectivePrice != null && effectivePrice === cheapestPrice;

      return {
        id: link.id,
        storefront: link.storefront,
        displayName: storeConfig?.displayName || link.storefront,
        color: storeConfig?.color || '#666666',
        hasAffiliate: storeConfig?.hasAffiliate || false,
        url: link.url || buildAffiliateUrl(link.storefront, game),
        currentPrice: link.currentPrice,
        salePrice: link.salePrice,
        onSale: link.onSale,
        currency: link.currency,
        bestPrice: isBestPrice,
        lastChecked: link.lastChecked,
      };
    });

    return success({ gameId: id, prices });
  } catch (err) {
    console.error('Game prices error:', err);
    return serverError();
  }
}
