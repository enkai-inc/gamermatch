'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GameDnaData {
  mechanicsVector: number[];
  themesVector: number[];
  pacingScore: number;
  complexityScore: number;
  socialScore: number;
  aestheticTags: string[];
  emotionalTone?: string[];
  moodTags?: string[];
}

const MECHANIC_LABELS = [
  'Open World', 'Turn-Based Combat', 'Real-Time Combat', 'Crafting',
  'Base Building', 'Stealth', 'Puzzle Solving', 'Deck Building',
  'Resource Mgmt', 'Exploration', 'Narrative Choice',
  'Co-op', 'Competitive MP', 'Roguelike', 'Metroidvania',
  'Sandbox', 'Survival', 'Platforming', 'Shooter', 'Hack & Slash',
];

const THEME_LABELS = [
  'Fantasy', 'Sci-Fi', 'Horror', 'Post-Apocalyptic',
  'Historical', 'Cyberpunk', 'Mythology', 'Romance',
  'Military', 'Space', 'Nature', 'Urban', 'Comedy', 'Drama',
  'Mystery', 'Western', 'Steampunk', 'Supernatural',
];

const MOOD_COLORS: Record<string, string> = {
  ADVENTURE: 'bg-amber-600/80 text-amber-100',
  RELAXING: 'bg-teal-600/80 text-teal-100',
  COMPETITIVE: 'bg-red-600/80 text-red-100',
  CREATIVE: 'bg-violet-600/80 text-violet-100',
  QUICK_FUN: 'bg-orange-600/80 text-orange-100',
  SOCIAL: 'bg-blue-600/80 text-blue-100',
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function GameDnaCard({ dna }: { dna: GameDnaData }) {
  const activeMechanics = MECHANIC_LABELS.filter((_, i) => dna.mechanicsVector[i] === 1);
  const activeThemes = THEME_LABELS.filter((_, i) => dna.themesVector[i] === 1);

  return (
    <Card glow>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.25-5.682c.25.023.5.05.75.082M5 14.5l-1.43 1.43a2.25 2.25 0 0 0 0 3.18l.21.21a2.25 2.25 0 0 0 3.18 0L8.5 17.78m-3.5-3.28h13m0 0 1.43 1.43a2.25 2.25 0 0 1 0 3.18l-.21.21a2.25 2.25 0 0 1-3.18 0L15.5 17.78"
            />
          </svg>
          Game DNA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Bars */}
        <div className="space-y-3">
          <ScoreBar label="Pacing" value={dna.pacingScore} />
          <ScoreBar label="Complexity" value={dna.complexityScore} />
          <ScoreBar label="Social" value={dna.socialScore} />
        </div>

        {/* Mechanics */}
        {activeMechanics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-400">Mechanics</h4>
            <div className="flex flex-wrap gap-1.5">
              {activeMechanics.map(m => (
                <Badge key={m} variant="secondary">{m}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Themes */}
        {activeThemes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-400">Themes</h4>
            <div className="flex flex-wrap gap-1.5">
              {activeThemes.map(t => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Mood Tags */}
        {dna.moodTags && dna.moodTags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-400">Mood</h4>
            <div className="flex flex-wrap gap-1.5">
              {dna.moodTags.map(mood => (
                <span
                  key={mood}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    MOOD_COLORS[mood] || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {mood.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Aesthetic Tags */}
        {dna.aestheticTags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-400">Aesthetics</h4>
            <p className="text-sm text-slate-300">
              {dna.aestheticTags.join(' \u00B7 ')}
            </p>
          </div>
        )}

        {/* Emotional Tone */}
        {dna.emotionalTone && dna.emotionalTone.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-400">Emotional Tone</h4>
            <p className="text-sm text-slate-300">
              {dna.emotionalTone.join(' \u00B7 ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
