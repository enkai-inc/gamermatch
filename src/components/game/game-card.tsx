'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RatingDisplay } from '@/components/game/rating-display';

interface GameCardProps {
  id: string;
  title: string;
  coverUrl?: string;
  genres: string[];
  rating: number;
  platforms: string[];
  className?: string;
}

export function GameCard({
  id,
  title,
  coverUrl,
  genres,
  rating,
  platforms,
  className,
}: GameCardProps) {
  return (
    <Link
      href={`/dashboard/games/${id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5',
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700">
            <span className="text-4xl">🎮</span>
          </div>
        )}
        {/* Rating overlay */}
        <div className="absolute right-2 top-2">
          <RatingDisplay rating={rating} size="sm" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-50 group-hover:text-emerald-400 transition-colors">
          {title}
        </h3>

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-[10px]">
              {genre}
            </Badge>
          ))}
        </div>

        {/* Platforms */}
        <p className="mt-auto text-xs text-slate-500">
          {platforms.join(' / ')}
        </p>
      </div>
    </Link>
  );
}
GameCard.displayName = 'GameCard';
