'use client';

import { useEffect, useState } from 'react';
import { ClusterGames } from '@/components/community/cluster-games';

interface ClusterInfo {
  clusterId: string;
  name: string;
  description: string;
}

interface UserClusterData {
  cluster: ClusterInfo & { memberCount: number };
  popularGames: Array<{ id: string; title: string; slug: string; coverUrl: string | null }>;
}

export default function CommunityPage() {
  const [userCluster, setUserCluster] = useState<UserClusterData | null>(null);
  const [allClusters, setAllClusters] = useState<ClusterInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/community/cluster').then((r) => r.json()),
      fetch('/api/community/popular').then((r) => r.json()),
    ])
      .then(([clusterRes, popularRes]) => {
        if (clusterRes.success) {
          setUserCluster(clusterRes.data);
        }
        if (popularRes.success) {
          setAllClusters(popularRes.data.clusters || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded" />
        <div className="h-40 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Community</h1>

      {/* User's cluster */}
      {userCluster && (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-2">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Your Cluster
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white">{userCluster.cluster.name}</h2>
          <p className="text-sm text-slate-400 mt-1">{userCluster.cluster.description}</p>
        </section>
      )}

      {/* Popular games in user's cluster */}
      {userCluster && (
        <section>
          <ClusterGames
            clusterId={userCluster.cluster.clusterId}
            clusterName={userCluster.cluster.name}
          />
        </section>
      )}

      {/* All clusters overview */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Browse Clusters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allClusters.map((cluster) => (
            <div
              key={cluster.clusterId}
              className={`rounded-xl border p-4 ${
                userCluster?.cluster.clusterId === cluster.clusterId
                  ? 'border-emerald-500 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <h3 className="font-medium text-white">{cluster.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{cluster.description}</p>
              {userCluster?.cluster.clusterId === cluster.clusterId && (
                <span className="inline-block mt-2 text-xs text-emerald-400 font-medium">
                  Your cluster
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
