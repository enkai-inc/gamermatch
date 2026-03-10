'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingDisplay } from '@/components/game/rating-display';
import { TasteRadar } from '@/components/dashboard/taste-radar';

interface GameSummary {
  id: string;
  title: string;
  coverUrl: string | null;
  slug: string;
}

interface DashboardStats {
  gamesPlayed: number;
  totalHours: number;
  averageRating: number;
  recommendationsCount: number;
  wishlistCount: number;
  profileComplete: boolean;
  tasteProfile: {
    favoriteGenres: unknown;
    preferredMechanics: unknown;
    moodPreferences: unknown;
    difficultyPref: string | null;
    sessionLength: string | null;
  } | null;
  recentJournal: {
    game: GameSummary;
    rating: number | null;
    status: string;
    updatedAt: string;
  }[];
  topRecommendations: {
    game: GameSummary;
    score: number;
    reason: string;
  }[];
  wishlistAlerts: {
    game: GameSummary;
    currentPrice: number | null;
    salePrice: number | null;
  }[];
}

const statusLabels: Record<string, string> = {
  BACKLOG: 'Backlog',
  PLAYING: 'Playing',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
  ON_HOLD: 'On Hold',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  PLAYING: 'default',
  COMPLETED: 'default',
  BACKLOG: 'secondary',
  DROPPED: 'outline',
  ON_HOLD: 'outline',
};

function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SectionLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="mb-1 h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{value}</p>
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  const [data, setData] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json();
        if (!json.success) {
          setError(json.error?.message || 'Failed to load dashboard');
          return;
        }
        setData(json.data);
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsLoadingSkeleton />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionLoadingSkeleton />
          <SectionLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-slate-400">{error || 'Something went wrong'}</p>
          <button
            className={buttonVariants({ variant: 'outline', className: 'mt-4' })}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Games Played"
          value={data.gamesPlayed}
          icon={'\uD83C\uDFAE'}
        />
        <StatCard
          label="Hours Logged"
          value={data.totalHours > 0 ? data.totalHours.toLocaleString() : '0'}
          icon={'\u23F1\uFE0F'}
        />
        <StatCard
          label="Avg Rating"
          value={data.averageRating > 0 ? data.averageRating.toFixed(1) : '--'}
          icon={'\u2B50'}
        />
        <StatCard
          label="Recommendations"
          value={data.recommendationsCount}
          icon={'\uD83C\uDFAF'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Recommendations</CardTitle>
              <Link
                href="/dashboard/discover"
                className="text-sm text-emerald-400 hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.topRecommendations.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                No recommendations yet. Complete your taste profile to get
                started.
              </p>
            ) : (
              <div className="space-y-3">
                {data.topRecommendations.map((rec) => (
                  <Link
                    key={rec.game.id}
                    href={`/games/${rec.game.slug}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-800"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                      {rec.game.coverUrl ? (
                        <img
                          src={rec.game.coverUrl}
                          alt={rec.game.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-700 text-lg">
                          {'\uD83C\uDFAE'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {rec.game.title}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {rec.reason}
                      </p>
                    </div>
                    <Badge variant="default" className="flex-shrink-0">
                      {Math.round(rec.score * 100)}%
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Journal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Journal Activity</CardTitle>
              <Link
                href="/dashboard/journal"
                className="text-sm text-emerald-400 hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentJournal.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                No journal entries yet. Start logging your games!
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentJournal.map((entry) => (
                  <Link
                    key={entry.game.id}
                    href={`/games/${entry.game.slug}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-800"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                      {entry.game.coverUrl ? (
                        <img
                          src={entry.game.coverUrl}
                          alt={entry.game.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-700 text-lg">
                          {'\uD83C\uDFAE'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {entry.game.title}
                      </p>
                      <Badge
                        variant={statusVariants[entry.status] || 'secondary'}
                        className="mt-1"
                      >
                        {statusLabels[entry.status] || entry.status}
                      </Badge>
                    </div>
                    {entry.rating !== null && (
                      <RatingDisplay rating={entry.rating} size="sm" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Taste Radar */}
      {data.profileComplete && data.tasteProfile && (
        <TasteRadar tasteProfile={data.tasteProfile} />
      )}

      {/* Wishlist Alerts */}
      {data.wishlistAlerts.length > 0 && (
        <Card glow>
          <CardHeader>
            <CardTitle>Wishlist Price Drops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.wishlistAlerts.map((alert) => (
                <Link
                  key={alert.game.id}
                  href={`/games/${alert.game.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 transition-colors hover:bg-emerald-500/10"
                >
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                    {alert.game.coverUrl ? (
                      <img
                        src={alert.game.coverUrl}
                        alt={alert.game.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-700">
                        {'\uD83C\uDFAE'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {alert.game.title}
                    </p>
                    <div className="flex items-center gap-2">
                      {alert.currentPrice !== null && (
                        <span className="text-xs text-slate-500 line-through">
                          ${alert.currentPrice.toFixed(2)}
                        </span>
                      )}
                      {alert.salePrice !== null && (
                        <span className="text-sm font-bold text-emerald-400">
                          ${alert.salePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/discover" className={buttonVariants()}>
              Discover Games
            </Link>
            <Link href="/dashboard/journal" className={buttonVariants({ variant: 'secondary' })}>
              Log a Game
            </Link>
            <Link href="/dashboard/profile" className={buttonVariants({ variant: 'outline' })}>
              Update Profile
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
DashboardOverview.displayName = 'DashboardOverview';
