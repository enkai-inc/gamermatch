'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface AffiliateLink {
  storefront: string;
  url: string;
  currentPrice: number | null;
  currency: string;
  onSale: boolean;
  salePrice: number | null;
}

interface WishlistGame {
  id: string;
  title: string;
  coverUrl: string | null;
  slug: string;
  genres: { genre: { name: string } }[];
  affiliateLinks: AffiliateLink[];
}

interface WishlistItem {
  id: string;
  gameId: string;
  targetPrice: number | null;
  notifyOnSale: boolean;
  createdAt: string;
  game: WishlistGame;
}

type SortOption = 'createdAt' | 'targetPrice' | 'title';

function getCheapest(links: AffiliateLink[]) {
  let best: AffiliateLink | null = null;
  for (const link of links) {
    const price = link.onSale && link.salePrice != null ? link.salePrice : link.currentPrice;
    if (price == null) continue;
    const bestPrice = best
      ? best.onSale && best.salePrice != null
        ? best.salePrice
        : best.currentPrice
      : null;
    if (bestPrice == null || price < bestPrice) {
      best = link;
    }
  }
  return best;
}

function formatPrice(price: number | null | undefined, currency = 'USD') {
  if (price == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

function WishlistSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex gap-4 p-4">
            <Skeleton className="h-24 w-16 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function WishlistList() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const sort = sortBy;
      const order = sortBy === 'title' ? 'asc' : 'desc';
      const res = await fetch(
        `/api/wishlist?limit=100&sort=${sort}&order=${order}`
      );
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  const handleRemove = async (id: string) => {
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      if (!res.ok) setItems(prev);
    } catch {
      setItems(prev);
    }
  };

  const handleUpdatePrice = async (id: string) => {
    const price = editPrice === '' ? null : parseFloat(editPrice);
    if (price !== null && (isNaN(price) || price <= 0)) return;

    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPrice: price ?? undefined }),
      });
      if (res.ok) {
        setItems((cur) =>
          cur.map((i) => (i.id === id ? { ...i, targetPrice: price } : i))
        );
      }
    } catch {
      // silently fail
    } finally {
      setEditingId(null);
      setEditPrice('');
    }
  };

  if (loading) return <WishlistSkeleton />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="mb-4 h-16 w-16 text-slate-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-slate-200">
          Your wishlist is empty
        </h3>
        <p className="text-slate-400">
          Browse recommendations to find games!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Sort by:</span>
        {(
          [
            ['createdAt', 'Date Added'],
            ['targetPrice', 'Price'],
            ['title', 'Name'],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            variant={sortBy === value ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const cheapest = getCheapest(item.game.affiliateLinks);
          const cheapestPrice = cheapest
            ? cheapest.onSale && cheapest.salePrice != null
              ? cheapest.salePrice
              : cheapest.currentPrice
            : null;
          const isOnSale = cheapest?.onSale ?? false;
          const meetsTarget =
            item.targetPrice != null &&
            cheapestPrice != null &&
            cheapestPrice <= item.targetPrice;

          return (
            <Card key={item.id} glow={meetsTarget}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-slate-800">
                  {item.game.coverUrl ? (
                    <Image
                      src={item.game.coverUrl}
                      alt={item.game.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-600">
                      No img
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-semibold text-slate-100">
                    {item.game.title}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {cheapest ? (
                      <span
                        className={
                          isOnSale ? 'text-emerald-400' : 'text-slate-300'
                        }
                      >
                        {formatPrice(cheapestPrice, cheapest.currency)}
                        {isOnSale && (
                          <span className="ml-1 text-xs text-emerald-500">
                            SALE
                          </span>
                        )}
                        <span className="ml-1 text-xs text-slate-500">
                          ({cheapest.storefront})
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-500">No price data</span>
                    )}

                    {editingId === item.id ? (
                      <span className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="h-7 w-24 text-xs"
                          placeholder="Target $"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdatePrice(item.id);
                            if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditPrice('');
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleUpdatePrice(item.id)}
                        >
                          Save
                        </Button>
                      </span>
                    ) : (
                      <button
                        className="text-xs text-slate-400 hover:text-slate-200"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditPrice(
                            item.targetPrice != null
                              ? String(item.targetPrice)
                              : ''
                          );
                        }}
                      >
                        Target:{' '}
                        {item.targetPrice != null
                          ? formatPrice(item.targetPrice)
                          : 'Set price'}
                      </button>
                    )}
                  </div>

                  {item.game.genres.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.game.genres.slice(0, 3).map((g) => (
                        <span
                          key={g.genre.name}
                          className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400"
                        >
                          {g.genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-slate-500 hover:text-red-400"
                  onClick={() => handleRemove(item.id)}
                  aria-label="Remove from wishlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
