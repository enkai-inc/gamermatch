'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecommendationCard } from './recommendation-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Recommendation {
  id: string;
  score: number;
  reason: string;
  source: string;
  game: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    summary: string | null;
    igdbRating: number | null;
    developer: string | null;
    genres: { genre: { name: string } }[];
  };
}

interface FeedState {
  recommendations: Recommendation[];
  loading: boolean;
  refreshing: boolean;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

interface RecommendationFeedProps {
  mood?: string | null;
}

export function RecommendationFeed({ mood }: RecommendationFeedProps) {
  const router = useRouter();
  const [state, setState] = useState<FeedState>({
    recommendations: [],
    loading: true,
    refreshing: false,
    page: 1,
    totalPages: 1,
    hasMore: false,
  });

  const fetchRecommendations = useCallback(async (page: number, append = false) => {
    try {
      const url = new URL('/api/recommendations', window.location.origin);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', '12');
      if (mood) url.searchParams.set('mood', mood);
      const res = await fetch(url.toString());
      const json = await res.json();

      if (json.success) {
        setState(prev => ({
          ...prev,
          recommendations: append
            ? [...prev.recommendations, ...json.data]
            : json.data,
          loading: false,
          page,
          totalPages: json.meta?.totalPages || 1,
          hasMore: page < (json.meta?.totalPages || 1),
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [mood]);

  useEffect(() => {
    setState(prev => ({ ...prev, loading: true, recommendations: [] }));
    fetchRecommendations(1);
  }, [fetchRecommendations]);

  const handleRefresh = async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    try {
      await fetch('/api/recommendations/refresh', { method: 'POST' });
      await fetchRecommendations(1);
    } finally {
      setState(prev => ({ ...prev, refreshing: false }));
    }
  };

  const handleLoadMore = () => {
    fetchRecommendations(state.page + 1, true);
  };

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/recommendations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      });
      setState(prev => ({
        ...prev,
        recommendations: prev.recommendations.filter(r => r.id !== id),
      }));
    } catch {
      // Silent fail
    }
  };

  const handleView = (slug: string) => {
    router.push(`/games/${slug}`);
  };

  // Loading skeletons
  if (state.loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (state.recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-center">
        <div className="mb-4 text-5xl text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-slate-200">
          {mood ? 'No games match this mood yet' : 'No recommendations yet'}
        </h3>
        <p className="mb-6 max-w-sm text-sm text-slate-400">
          {mood
            ? 'Try a different mood or clear the filter to see all recommendations.'
            : 'Complete your taste profile to get personalized game recommendations.'}
        </p>
        {!mood && (
          <Button onClick={() => router.push('/taste-profile')}>
            Set Up Taste Profile
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Refresh button */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={state.refreshing}
        >
          {state.refreshing ? 'Refreshing...' : 'Refresh Recommendations'}
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.recommendations.map(rec => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onDismiss={handleDismiss}
            onView={handleView}
          />
        ))}
      </div>

      {/* Load More */}
      {state.hasMore && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
