'use client';

import { cn } from '@/lib/utils';

const DIFFICULTY_OPTIONS = [
  { value: 'CASUAL', label: 'Casual', description: 'Relaxed gameplay, minimal challenge' },
  { value: 'MODERATE', label: 'Moderate', description: 'Some challenge, fair difficulty curve' },
  { value: 'CHALLENGING', label: 'Challenging', description: 'Requires skill and strategy' },
  { value: 'HARDCORE', label: 'Hardcore', description: 'Punishing, for mastery seekers' },
];

const SESSION_OPTIONS = [
  { value: 'QUICK', label: 'Quick', description: '15-30 minutes' },
  { value: 'MEDIUM', label: 'Medium', description: '1-2 hours' },
  { value: 'LONG', label: 'Long', description: '2-4 hours' },
  { value: 'MARATHON', label: 'Marathon', description: '4+ hours' },
];

interface StepDifficultyProps {
  difficulty: string;
  sessionLength: string;
  onDifficultyChange: (value: string) => void;
  onSessionLengthChange: (value: string) => void;
}

export function StepDifficulty({
  difficulty,
  sessionLength,
  onDifficultyChange,
  onSessionLengthChange,
}: StepDifficultyProps) {
  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-100">
        Difficulty and session length
      </h2>
      <p className="mb-6 text-sm text-slate-400">
        How do you like to play?
      </p>

      <div className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-slate-300">Preferred Difficulty</h3>
        <div className="grid grid-cols-2 gap-3">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onDifficultyChange(opt.value)}
              className={cn(
                'rounded-lg border p-4 text-left transition-all',
                difficulty === opt.value
                  ? 'border-emerald-500 bg-emerald-600/20 shadow-sm shadow-emerald-500/20'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              )}
            >
              <div className={cn(
                'text-sm font-semibold',
                difficulty === opt.value ? 'text-emerald-400' : 'text-slate-200'
              )}>
                {opt.label}
              </div>
              <div className="mt-1 text-xs text-slate-400">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-300">Typical Session Length</h3>
        <div className="grid grid-cols-2 gap-3">
          {SESSION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSessionLengthChange(opt.value)}
              className={cn(
                'rounded-lg border p-4 text-left transition-all',
                sessionLength === opt.value
                  ? 'border-emerald-500 bg-emerald-600/20 shadow-sm shadow-emerald-500/20'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              )}
            >
              <div className={cn(
                'text-sm font-semibold',
                sessionLength === opt.value ? 'text-emerald-400' : 'text-slate-200'
              )}>
                {opt.label}
              </div>
              <div className="mt-1 text-xs text-slate-400">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
