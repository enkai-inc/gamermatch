import { RecommendationFeed } from '@/components/recommendations/recommendation-feed';

export default function DiscoverPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-100">Discover Games</h1>
        <p className="text-slate-400">
          Personalized recommendations based on your taste profile and play history.
        </p>
      </div>

      {/* Mood filter placeholder - will be implemented in a future update */}
      <div className="mb-6" />

      <RecommendationFeed />
    </div>
  );
}
