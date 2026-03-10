'use client';

import { useState } from 'react';
import { MoodSelector } from '@/components/recommendations/mood-selector';
import { RecommendationFeed } from '@/components/recommendations/recommendation-feed';

const MOOD_SUBTITLES: Record<string, string> = {
  RELAXING: 'Calm, story-rich games to wind down with.',
  COMPETITIVE: 'Intense matches to test your skills.',
  SOCIAL: 'Games to play with friends and connect.',
  ADVENTURE: 'Immersive worlds waiting to be explored.',
  CREATIVE: 'Build, craft, and let your imagination run wild.',
  QUICK_FUN: 'Pick up and play in 15-30 minutes.',
};

const DEFAULT_SUBTITLE =
  'Personalized recommendations based on your taste profile and play history.';

export default function DiscoverPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const subtitle = selectedMood
    ? MOOD_SUBTITLES[selectedMood] || DEFAULT_SUBTITLE
    : DEFAULT_SUBTITLE;

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-100">Discover Games</h1>
        <p className="text-slate-400">{subtitle}</p>
      </div>

      <div className="mb-6">
        <MoodSelector selectedMood={selectedMood} onMoodChange={setSelectedMood} />
      </div>

      <RecommendationFeed mood={selectedMood} />
    </div>
  );
}
