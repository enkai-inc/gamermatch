'use client';

import { cn } from '@/lib/utils';

const GENRES = [
  'RPG', 'FPS', 'Strategy', 'Puzzle', 'Platformer', 'Horror',
  'Racing', 'Sports', 'Simulation', 'Adventure', 'Fighting', 'MOBA',
  'Battle Royale', 'Roguelike', 'Sandbox', 'Visual Novel',
];

interface StepGenresProps {
  selected: string[];
  onChange: (genres: string[]) => void;
}

export function StepGenres({ selected, onChange }: StepGenresProps) {
  const toggle = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-100">
        What genres do you enjoy?
      </h2>
      <p className="mb-6 text-sm text-slate-400">
        Select at least one genre that you love playing.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {GENRES.map((genre) => {
          const isSelected = selected.includes(genre);
          return (
            <button
              key={genre}
              type="button"
              onClick={() => toggle(genre)}
              className={cn(
                'rounded-lg border px-4 py-3 text-sm font-medium transition-all',
                isSelected
                  ? 'border-emerald-500 bg-emerald-600/20 text-emerald-400 shadow-sm shadow-emerald-500/20'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700'
              )}
            >
              {genre}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="mt-4 text-xs text-red-400">Please select at least one genre.</p>
      )}
    </div>
  );
}
