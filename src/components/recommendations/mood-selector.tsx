'use client';

import { useState } from 'react';
import { Moon, Swords, Users, Map, Paintbrush, Zap, Shuffle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MOODS = [
  {
    id: 'RELAXING',
    name: 'Relaxing Evening',
    description: 'Wind down with calm, story-rich games',
    icon: Moon,
  },
  {
    id: 'COMPETITIVE',
    name: 'Competitive Edge',
    description: 'Test your skills in intense matches',
    icon: Swords,
  },
  {
    id: 'SOCIAL',
    name: 'Social Gaming',
    description: 'Play with friends and connect',
    icon: Users,
  },
  {
    id: 'ADVENTURE',
    name: 'Epic Adventure',
    description: 'Dive into immersive worlds',
    icon: Map,
  },
  {
    id: 'CREATIVE',
    name: 'Creative Mode',
    description: 'Build, craft, and create',
    icon: Paintbrush,
  },
  {
    id: 'QUICK_FUN',
    name: 'Quick Fun',
    description: 'Pick-up-and-play in 15-30 minutes',
    icon: Zap,
  },
] as const;

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodChange: (mood: string | null) => void;
}

export function MoodSelector({ selectedMood, onMoodChange }: MoodSelectorProps) {
  const [, setAnimating] = useState(false);

  const handleSurpriseMe = () => {
    setAnimating(true);
    const randomIndex = Math.floor(Math.random() * MOODS.length);
    onMoodChange(MOODS[randomIndex].id);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">How are you feeling?</h2>
        <div className="flex gap-2">
          {selectedMood && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoodChange(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSurpriseMe}
            className="text-slate-300"
          >
            <Shuffle className="mr-1 h-4 w-4" />
            Surprise Me
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          const Icon = mood.icon;

          return (
            <Card
              key={mood.id}
              glow={isSelected}
              className={cn(
                'cursor-pointer p-4 transition-all duration-200 hover:border-slate-700',
                isSelected && 'scale-[1.02] border-emerald-500/50 shadow-lg shadow-emerald-500/10',
                !isSelected && 'hover:bg-slate-800/50'
              )}
              onClick={() => onMoodChange(isSelected ? null : mood.id)}
            >
              <div className="flex flex-col items-center text-center">
                <Icon
                  className={cn(
                    'mb-2 h-6 w-6 transition-colors',
                    isSelected ? 'text-emerald-400' : 'text-slate-400'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-emerald-300' : 'text-slate-200'
                  )}
                >
                  {mood.name}
                </span>
                <span className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {mood.description}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
