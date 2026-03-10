'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    score: number;
    reason: string;
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
  };
  onDismiss: (id: string) => void;
  onView: (slug: string) => void;
}

export function RecommendationCard({ recommendation, onDismiss, onView }: RecommendationCardProps) {
  const { game } = recommendation;
  const matchPercent = Math.round(recommendation.score * 100);
  const isHighMatch = matchPercent >= 85;

  const handleClick = async () => {
    // Track click
    try {
      await fetch(`/api/recommendations/${recommendation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clicked: true }),
      });
    } catch {
      // Silent fail for tracking
    }
    onView(game.slug);
  };

  return (
    <Card
      glow={isHighMatch}
      className="group overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:border-slate-700"
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <span className="text-4xl text-slate-600">{game.title.charAt(0)}</span>
          </div>
        )}

        {/* Match Badge */}
        <div className="absolute right-2 top-2">
          <Badge
            variant={isHighMatch ? 'default' : 'secondary'}
            className={isHighMatch ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : ''}
          >
            {matchPercent}% Match
          </Badge>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(recommendation.id);
          }}
          className="absolute right-2 top-10 rounded-full bg-slate-900/70 p-1.5 text-slate-400 opacity-0 backdrop-blur-sm transition-opacity hover:bg-slate-900 hover:text-slate-200 group-hover:opacity-100"
          aria-label="Dismiss recommendation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-slate-100">
          {game.title}
        </h3>

        {/* Developer */}
        {game.developer && (
          <p className="mb-2 text-xs text-slate-500">{game.developer}</p>
        )}

        {/* Genres */}
        <div className="mb-2 flex flex-wrap gap-1">
          {game.genres.slice(0, 3).map((g) => (
            <Badge key={g.genre.name} variant="outline" className="text-[10px] px-1.5 py-0">
              {g.genre.name}
            </Badge>
          ))}
        </div>

        {/* Reason */}
        <p className="mb-3 line-clamp-2 text-xs text-slate-400">
          {recommendation.reason}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 text-xs" onClick={handleClick}>
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/dashboard/games/${game.id}`;
            }}
          >
            Buy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
