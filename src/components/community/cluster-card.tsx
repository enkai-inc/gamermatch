'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ClusterData {
  cluster: {
    clusterId: string;
    name: string;
    description: string;
    memberCount: number;
  };
  popularGames: Array<{
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    igdbRating: number | null;
  }>;
}

export function ClusterCard() {
  const [data, setData] = useState<ClusterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/community/cluster')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-700 rounded mb-2" />
        <div className="h-4 w-72 bg-slate-700 rounded" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-slate-400">Complete your taste profile to join a community cluster.</p>
        <Link href="/dashboard/profile" className="text-emerald-400 hover:underline text-sm mt-2 inline-block">
          Set up profile
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{data.cluster.name}</h3>
        <p className="text-sm text-slate-400 mt-1">{data.cluster.description}</p>
      </div>

      {data.popularGames.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Popular in your cluster</h4>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {data.popularGames.slice(0, 5).map((game) => (
              <Link
                key={game.id}
                href={`/dashboard/games/${game.slug}`}
                className="flex-shrink-0 group"
              >
                <div className="w-24 h-32 rounded-lg bg-slate-800 overflow-hidden">
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
                <p className="text-xs text-slate-400 mt-1 w-24 truncate group-hover:text-emerald-400">
                  {game.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/dashboard/community"
        className="text-sm text-emerald-400 hover:underline mt-4 inline-block"
      >
        View more
      </Link>
    </div>
  );
}
