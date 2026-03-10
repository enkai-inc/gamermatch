'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Game {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  igdbRating: number | null;
  genres?: Array<{ genre: { name: string } }>;
  platforms?: Array<{ platform: { name: string } }>;
}

interface ClusterGamesProps {
  clusterId: string;
  clusterName: string;
}

export function ClusterGames({ clusterId, clusterName }: ClusterGamesProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/community/popular?cluster=${encodeURIComponent(clusterId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setGames(json.data.games);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clusterId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Popular with {clusterName}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-[3/4] bg-slate-800 rounded-lg" />
              <div className="h-4 w-24 bg-slate-800 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Popular with {clusterName}</h3>
      {games.length === 0 ? (
        <p className="text-slate-400 text-sm">No games found for this cluster yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/dashboard/games/${game.slug}`}
              className="group"
            >
              <div className="w-full aspect-[3/4] rounded-lg bg-slate-800 overflow-hidden">
                {game.coverUrl ? (
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 p-2 text-center">
                    {game.title}
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-300 mt-2 truncate group-hover:text-emerald-400">
                {game.title}
              </p>
              {game.igdbRating && (
                <p className="text-xs text-slate-500">{Math.round(game.igdbRating)}% rating</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
