'use client';

import { cn } from '@/lib/utils';

const PLATFORMS = [
  { value: 'PC', icon: 'PC' },
  { value: 'PlayStation', icon: 'PS' },
  { value: 'Xbox', icon: 'XB' },
  { value: 'Nintendo Switch', icon: 'NS' },
  { value: 'Mobile', icon: 'MB' },
  { value: 'VR', icon: 'VR' },
];

interface StepPlatformsProps {
  selected: string[];
  onChange: (platforms: string[]) => void;
}

export function StepPlatforms({ selected, onChange }: StepPlatformsProps) {
  const toggle = (platform: string) => {
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-100">
        Your platforms
      </h2>
      <p className="mb-6 text-sm text-slate-400">
        Select at least one platform you play on.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform.value);
          return (
            <button
              key={platform.value}
              type="button"
              onClick={() => toggle(platform.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-6 transition-all',
                isSelected
                  ? 'border-emerald-500 bg-emerald-600/20 shadow-sm shadow-emerald-500/20'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-700'
              )}
            >
              <span className={cn(
                'text-2xl font-bold',
                isSelected ? 'text-emerald-400' : 'text-slate-400'
              )}>
                {platform.icon}
              </span>
              <span className={cn(
                'text-sm font-medium',
                isSelected ? 'text-emerald-300' : 'text-slate-300'
              )}>
                {platform.value}
              </span>
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="mt-4 text-xs text-red-400">Please select at least one platform.</p>
      )}
    </div>
  );
}
