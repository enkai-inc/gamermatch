'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GameResult {
  id: string;
  title: string;
  coverUrl: string | null;
}

interface StepSeedGamesProps {
  selected: string[];
  onChange: (games: string[]) => void;
}

export function StepSeedGames({ selected, onChange }: StepSeedGamesProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GameResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
        setShowDropdown(true);
      }
    } catch {
      // ignore search errors
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const addGame = (title: string) => {
    if (selected.length >= 5 || selected.includes(title)) return;
    onChange([...selected, title]);
    setQuery('');
    setShowDropdown(false);
  };

  const removeGame = (title: string) => {
    onChange(selected.filter((g) => g !== title));
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-100">
        Games you love
      </h2>
      <p className="mb-6 text-sm text-slate-400">
        Add 1-5 games you enjoy to help us understand your taste.
      </p>

      <div className="relative mb-4">
        <Input
          placeholder="Search for a game..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim().length >= 2) {
              e.preventDefault();
              addGame(query.trim());
            }
          }}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          disabled={selected.length >= 5}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            Searching...
          </div>
        )}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-800 shadow-lg">
            {results.map((game) => (
              <button
                key={game.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addGame(game.title)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
              >
                {game.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((title) => (
            <span
              key={title}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-600/20 px-3 py-1 text-sm text-emerald-400"
            >
              {title}
              <button
                type="button"
                onClick={() => removeGame(title)}
                className="ml-1 text-emerald-400/60 hover:text-emerald-300"
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {selected.length === 0 && (
        <p className="mt-2 text-xs text-slate-500">
          You can also type a game title and press enter to add it manually.
        </p>
      )}

      <p className="mt-4 text-xs text-slate-500">
        {selected.length}/5 games selected
        {selected.length === 0 && ' (minimum 1)'}
      </p>
    </div>
  );
}
