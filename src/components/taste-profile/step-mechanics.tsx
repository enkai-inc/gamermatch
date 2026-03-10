'use client';

import { cn } from '@/lib/utils';

const MECHANICS = [
  'Open World', 'Turn-Based Combat', 'Real-Time Combat', 'Crafting',
  'Base Building', 'Stealth', 'Puzzle Solving', 'Deck Building',
  'Resource Management', 'Exploration', 'Narrative Choice', 'Co-op',
  'Competitive Multiplayer',
];

interface StepMechanicsProps {
  selected: string[];
  onChange: (mechanics: string[]) => void;
}

export function StepMechanics({ selected, onChange }: StepMechanicsProps) {
  const toggle = (mechanic: string) => {
    if (selected.includes(mechanic)) {
      onChange(selected.filter((m) => m !== mechanic));
    } else {
      onChange([...selected, mechanic]);
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-100">
        Preferred game mechanics
      </h2>
      <p className="mb-6 text-sm text-slate-400">
        Select mechanics you enjoy. This step is optional.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MECHANICS.map((mechanic) => {
          const isSelected = selected.includes(mechanic);
          return (
            <button
              key={mechanic}
              type="button"
              onClick={() => toggle(mechanic)}
              className={cn(
                'rounded-lg border px-4 py-3 text-sm font-medium transition-all',
                isSelected
                  ? 'border-emerald-500 bg-emerald-600/20 text-emerald-400 shadow-sm shadow-emerald-500/20'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700'
              )}
            >
              {mechanic}
            </button>
          );
        })}
      </div>
    </div>
  );
}
