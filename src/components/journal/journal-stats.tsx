'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingDisplay } from '@/components/game/rating-display';

interface StatsData {
  totalGames: number;
  totalHours: number;
  averageRating: number;
  byStatus: Record<string, number>;
  topRated: { game: { id: string; title: string; coverUrl: string | null; slug: string }; rating: number | null }[];
  recentlyPlayed: { game: { id: string; title: string; coverUrl: string | null; slug: string }; updatedAt: string }[];
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-50">{value}</p>
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function JournalStats() {
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/journal/stats');
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (err) {
        console.error('Failed to fetch journal stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <StatsSkeleton />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Games" value={stats.totalGames} />
        <StatCard label="Total Hours" value={stats.totalHours.toFixed(1)} />
        <StatCard label="Avg Rating" value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'} />
        <StatCard label="Currently Playing" value={stats.byStatus['PLAYING'] ?? 0} />
      </div>

      {/* Top Rated */}
      {stats.topRated.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Rated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topRated.map((item) => (
                <div key={item.game.id} className="flex items-center gap-3">
                  <div className="h-10 w-8 flex-shrink-0 overflow-hidden rounded bg-slate-800">
                    {item.game.coverUrl ? (
                      <img src={item.game.coverUrl} alt={item.game.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs">🎮</div>
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm text-slate-200">{item.game.title}</span>
                  {item.rating !== null && <RatingDisplay rating={item.rating} size="sm" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
JournalStats.displayName = 'JournalStats';
