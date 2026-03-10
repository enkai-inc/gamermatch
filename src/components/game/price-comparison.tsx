'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceEntry {
  id: string;
  storefront: string;
  displayName: string;
  color: string;
  hasAffiliate: boolean;
  url: string;
  currentPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  currency: string;
  bestPrice: boolean;
}

interface PriceData {
  gameId: string;
  prices: PriceEntry[];
}

function formatPrice(price: number | null, currency: string) {
  if (price == null) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
}

export function PriceComparison({ gameId }: { gameId: string }) {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch(`/api/games/${gameId}/prices`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, [gameId]);

  const handleClick = async (entry: PriceEntry) => {
    // Track click in background
    try {
      fetch('/api/affiliate/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateLinkId: entry.id,
          gameId,
          storefront: entry.storefront,
        }),
      });
    } catch {
      // Silent fail for tracking
    }

    // Open store in new tab
    window.open(entry.url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Where to Buy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.prices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Where to Buy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">Price info coming soon</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where to Buy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.prices.map((entry) => {
          const effectivePrice = entry.onSale && entry.salePrice != null ? entry.salePrice : entry.currentPrice;
          const displayPrice = formatPrice(effectivePrice, entry.currency);

          return (
            <button
              key={entry.id}
              onClick={() => handleClick(entry)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-700 p-3 text-left transition-colors hover:border-slate-600 hover:bg-slate-800/50"
            >
              {/* Store color indicator */}
              <div
                className="h-8 w-8 shrink-0 rounded-md"
                style={{ backgroundColor: entry.color }}
              />

              {/* Store info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-100">
                    {entry.displayName}
                  </span>
                  {entry.bestPrice && (
                    <Badge className="text-[10px] px-1.5 py-0">Best Price</Badge>
                  )}
                  {entry.onSale && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Sale</Badge>
                  )}
                </div>
                {entry.hasAffiliate && (
                  <span className="text-[10px] text-slate-500">Affiliate link</span>
                )}
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                {displayPrice ? (
                  <div>
                    {entry.onSale && entry.currentPrice != null && (
                      <span className="text-xs text-slate-500 line-through mr-1">
                        {formatPrice(entry.currentPrice, entry.currency)}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-emerald-400">
                      {displayPrice}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">View Price</span>
                )}
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
