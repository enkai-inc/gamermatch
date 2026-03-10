import * as React from 'react';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10';
  if (rating >= 6) return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
  if (rating >= 4) return 'text-orange-400 border-orange-400/50 bg-orange-400/10';
  return 'text-red-400 border-red-400/50 bg-red-400/10';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
} as const;

export function RatingDisplay({ rating, size = 'md', className }: RatingDisplayProps) {
  const clamped = Math.min(10, Math.max(0, rating));
  const display = Number.isInteger(clamped) ? clamped.toString() : clamped.toFixed(1);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-bold',
        getRatingColor(clamped),
        sizeClasses[size],
        className
      )}
      aria-label={`Rating: ${display} out of 10`}
    >
      {display}
    </div>
  );
}
RatingDisplay.displayName = 'RatingDisplay';
