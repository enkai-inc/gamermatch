'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PlayStatus = 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED' | 'ON_HOLD';

interface SearchResult {
  id: string;
  title: string;
  coverUrl: string | null;
}

const STATUS_OPTIONS: { label: string; value: PlayStatus }[] = [
  { label: 'Backlog', value: 'BACKLOG' },
  { label: 'Playing', value: 'PLAYING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Dropped', value: 'DROPPED' },
  { label: 'On Hold', value: 'ON_HOLD' },
];

interface AddJournalEntryProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddJournalEntry({ open, onClose, onAdded }: AddJournalEntryProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [selectedGame, setSelectedGame] = React.useState<SearchResult | null>(null);
  const [status, setStatus] = React.useState<PlayStatus>('BACKLOG');
  const [rating, setRating] = React.useState<number | ''>('');
  const [hoursPlayed, setHoursPlayed] = React.useState<number | ''>('');
  const [notes, setNotes] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) setResults(json.data);
      } catch {
        // ignore search errors
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  const resetForm = () => {
    setQuery('');
    setResults([]);
    setSelectedGame(null);
    setStatus('BACKLOG');
    setRating('');
    setHoursPlayed('');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;

    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        gameId: selectedGame.id,
        status,
      };
      if (rating !== '') body.rating = Number(rating);
      if (hoursPlayed !== '') body.hoursPlayed = Number(hoursPlayed);
      if (notes.trim()) body.notes = notes.trim();

      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        resetForm();
        onAdded();
        onClose();
      } else if (json.error?.code === 'CONFLICT') {
        setError('This game is already in your journal.');
      } else {
        setError(json.error?.message || 'Failed to add entry.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Add Game to Journal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Game Search */}
            {!selectedGame ? (
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Search for a game</label>
                <Input
                  placeholder="Type to search games..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                {searching && (
                  <p className="text-xs text-slate-500">Searching...</p>
                )}
                {results.length > 0 && (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800">
                    {results.map((game) => (
                      <button
                        key={game.id}
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-slate-700"
                        onClick={() => {
                          setSelectedGame(game);
                          setQuery('');
                          setResults([]);
                        }}
                      >
                        <div className="h-10 w-8 flex-shrink-0 overflow-hidden rounded bg-slate-700">
                          {game.coverUrl ? (
                            <img src={game.coverUrl} alt={game.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs">🎮</div>
                          )}
                        </div>
                        <span className="truncate text-sm text-slate-50">{game.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-3">
                <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-slate-700">
                  {selectedGame.coverUrl ? (
                    <img src={selectedGame.coverUrl} alt={selectedGame.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs">🎮</div>
                  )}
                </div>
                <span className="flex-1 font-medium text-slate-50">{selectedGame.title}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGame(null)}
                >
                  Change
                </Button>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PlayStatus)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">
                Rating {rating !== '' ? `(${rating}/10)` : '(optional)'}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={rating === '' ? 5 : rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1</span>
                <span>10</span>
              </div>
              {rating !== '' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRating('')}
                  className="text-xs"
                >
                  Clear rating
                </Button>
              )}
            </div>

            {/* Hours Played */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Hours Played (optional)</label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={hoursPlayed}
                onChange={(e) => setHoursPlayed(e.target.value ? Number(e.target.value) : '')}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Your thoughts on this game..."
                maxLength={2000}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedGame || submitting}>
                {submitting ? 'Adding...' : 'Add to Journal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
AddJournalEntry.displayName = 'AddJournalEntry';
