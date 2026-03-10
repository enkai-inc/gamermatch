'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingDisplay } from '@/components/game/rating-display';

type PlayStatus = 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED' | 'ON_HOLD';

interface JournalGame {
  id: string;
  title: string;
  coverUrl: string | null;
  slug: string;
  genres: { genre: { name: string } }[];
}

interface JournalEntry {
  id: string;
  rating: number | null;
  status: PlayStatus;
  hoursPlayed: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  game: JournalGame;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_TABS: { label: string; value: PlayStatus | null }[] = [
  { label: 'All', value: null },
  { label: 'Playing', value: 'PLAYING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Backlog', value: 'BACKLOG' },
  { label: 'Dropped', value: 'DROPPED' },
  { label: 'On Hold', value: 'ON_HOLD' },
];

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Date Added', value: 'createdAt' },
  { label: 'Rating', value: 'rating' },
  { label: 'Title', value: 'title' },
  { label: 'Hours', value: 'hoursPlayed' },
];

const STATUS_BADGE_VARIANT: Record<PlayStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PLAYING: 'default',
  COMPLETED: 'secondary',
  BACKLOG: 'outline',
  DROPPED: 'destructive',
  ON_HOLD: 'outline',
};

const STATUS_LABELS: Record<PlayStatus, string> = {
  PLAYING: 'Playing',
  COMPLETED: 'Completed',
  BACKLOG: 'Backlog',
  DROPPED: 'Dropped',
  ON_HOLD: 'On Hold',
};

function JournalListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <Skeleton className="h-16 w-12 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function JournalList() {
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [meta, setMeta] = React.useState<PaginationMeta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeStatus, setActiveStatus] = React.useState<PlayStatus | null>(null);
  const [sort, setSort] = React.useState('createdAt');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
  const [page, setPage] = React.useState(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const fetchEntries = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort,
        order,
      });
      if (activeStatus) params.set('status', activeStatus);

      const res = await fetch(`/api/journal?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data);
        setMeta(json.meta);
      }
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, order, activeStatus]);

  React.useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const handleStatusChange = (status: PlayStatus | null) => {
    setActiveStatus(status);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.label}
            variant={activeStatus === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-400">Sort by:</label>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
        >
          {order === 'asc' ? 'Asc' : 'Desc'}
        </Button>
      </div>

      {/* Entry List */}
      {loading ? (
        <JournalListSkeleton />
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">
              {activeStatus
                ? `No games with status "${STATUS_LABELS[activeStatus]}".`
                : 'Your journal is empty. Add a game to get started!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="transition-colors hover:border-slate-700">
              <CardContent className="p-4">
                <div
                  className="flex cursor-pointer items-center gap-4"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  {/* Game Cover */}
                  <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-slate-800">
                    {entry.game.coverUrl ? (
                      <img
                        src={entry.game.coverUrl}
                        alt={entry.game.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg">
                        🎮
                      </div>
                    )}
                  </div>

                  {/* Game Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-50">
                      {entry.game.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant={STATUS_BADGE_VARIANT[entry.status]}>
                        {STATUS_LABELS[entry.status]}
                      </Badge>
                      {entry.hoursPlayed !== null && (
                        <span className="text-xs text-slate-400">
                          {entry.hoursPlayed}h played
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  {entry.rating !== null && (
                    <RatingDisplay rating={entry.rating} size="sm" />
                  )}
                </div>

                {/* Expanded Details */}
                {expandedId === entry.id && (
                  <div className="mt-4 border-t border-slate-800 pt-4">
                    {entry.notes && (
                      <p className="mb-3 text-sm text-slate-300">{entry.notes}</p>
                    )}
                    <div className="flex items-center gap-2">
                      {deleteConfirm === entry.id ? (
                        <>
                          <span className="text-sm text-red-400">Delete this entry?</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setDeleteConfirm(entry.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-400">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
JournalList.displayName = 'JournalList';
