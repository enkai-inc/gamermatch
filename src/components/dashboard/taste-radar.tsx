'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TasteRadarProps {
  tasteProfile: {
    favoriteGenres: unknown;
    preferredMechanics: unknown;
    moodPreferences: unknown;
    difficultyPref: string | null;
    sessionLength: string | null;
  } | null;
}

interface Dimension {
  label: string;
  value: number;
}

const DIMENSIONS = ['Action', 'Strategy', 'Story', 'Social', 'Creative', 'Challenge'] as const;

const genreToDimension: Record<string, (typeof DIMENSIONS)[number]> = {
  'action': 'Action',
  'shooter': 'Action',
  'fighting': 'Action',
  'platformer': 'Action',
  'racing': 'Action',
  'strategy': 'Strategy',
  'puzzle': 'Strategy',
  'turn-based': 'Strategy',
  'tactical': 'Strategy',
  'rpg': 'Story',
  'adventure': 'Story',
  'visual-novel': 'Story',
  'narrative': 'Story',
  'multiplayer': 'Social',
  'mmo': 'Social',
  'co-op': 'Social',
  'party': 'Social',
  'sandbox': 'Creative',
  'simulation': 'Creative',
  'building': 'Creative',
  'music': 'Creative',
  'survival': 'Challenge',
  'roguelike': 'Challenge',
  'souls-like': 'Challenge',
  'horror': 'Challenge',
};

function computeDimensions(profile: TasteRadarProps['tasteProfile']): Dimension[] {
  const scores: Record<string, number> = {};
  for (const d of DIMENSIONS) {
    scores[d] = 0;
  }

  if (!profile) {
    return DIMENSIONS.map((label) => ({ label, value: 0 }));
  }

  // Map genres
  const genres = Array.isArray(profile.favoriteGenres) ? profile.favoriteGenres : [];
  for (const genre of genres) {
    const key = String(genre).toLowerCase().replace(/\s+/g, '-');
    const dim = genreToDimension[key];
    if (dim) {
      scores[dim] = Math.min(10, scores[dim] + 3);
    }
  }

  // Map mechanics
  const mechanics = Array.isArray(profile.preferredMechanics) ? profile.preferredMechanics : [];
  for (const mechanic of mechanics) {
    const key = String(mechanic).toLowerCase().replace(/\s+/g, '-');
    const dim = genreToDimension[key];
    if (dim) {
      scores[dim] = Math.min(10, scores[dim] + 2);
    }
  }

  // Difficulty affects Challenge
  if (profile.difficultyPref) {
    const diffMap: Record<string, number> = {
      CASUAL: 2,
      MODERATE: 4,
      CHALLENGING: 7,
      HARDCORE: 10,
    };
    scores['Challenge'] = Math.min(10, scores['Challenge'] + (diffMap[profile.difficultyPref] ?? 0));
  }

  // Session length affects Strategy and Story
  if (profile.sessionLength) {
    const lenMap: Record<string, number> = {
      QUICK: 1,
      MEDIUM: 3,
      LONG: 5,
      MARATHON: 7,
    };
    const bonus = lenMap[profile.sessionLength] ?? 0;
    scores['Strategy'] = Math.min(10, scores['Strategy'] + Math.floor(bonus / 2));
    scores['Story'] = Math.min(10, scores['Story'] + Math.floor(bonus / 2));
  }

  // Mood preferences
  const moods = (typeof profile.moodPreferences === 'object' && profile.moodPreferences !== null)
    ? profile.moodPreferences as Record<string, unknown>
    : {};
  const moodToDim: Record<string, (typeof DIMENSIONS)[number]> = {
    COMPETITIVE: 'Action',
    ADVENTURE: 'Story',
    SOCIAL: 'Social',
    CREATIVE: 'Creative',
    RELAXING: 'Strategy',
    QUICK_FUN: 'Action',
  };
  for (const [mood, val] of Object.entries(moods)) {
    if (val) {
      const dim = moodToDim[mood];
      if (dim) {
        scores[dim] = Math.min(10, scores[dim] + 2);
      }
    }
  }

  // Normalize: ensure at least some spread
  const maxScore = Math.max(...Object.values(scores), 1);
  return DIMENSIONS.map((label) => ({
    label,
    value: Math.round((scores[label] / maxScore) * 10),
  }));
}

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 90;
const RINGS = [0.25, 0.5, 0.75, 1.0];

function polarToCartesian(angle: number, radius: number): [number, number] {
  // Start from top (offset by -90 degrees)
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

export function TasteRadar({ tasteProfile }: TasteRadarProps) {
  const dimensions = computeDimensions(tasteProfile);
  const angleStep = 360 / dimensions.length;

  const hasData = dimensions.some((d) => d.value > 0);

  if (!hasData) {
    return null;
  }

  // Build polygon points for the data
  const dataPoints = dimensions.map((dim, i) => {
    const angle = i * angleStep;
    const r = (dim.value / 10) * RADIUS;
    return polarToCartesian(angle, r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Taste Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="overflow-visible"
        >
          {/* Background rings */}
          {RINGS.map((scale) => {
            const ringPoints = dimensions.map((_, i) => {
              const angle = i * angleStep;
              return polarToCartesian(angle, RADIUS * scale);
            });
            const ringPath =
              ringPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';
            return (
              <path
                key={scale}
                d={ringPath}
                fill="none"
                stroke="rgb(51, 65, 85)"
                strokeWidth={1}
              />
            );
          })}

          {/* Axis lines */}
          {dimensions.map((_, i) => {
            const angle = i * angleStep;
            const [x, y] = polarToCartesian(angle, RADIUS);
            return (
              <line
                key={`axis-${i}`}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                stroke="rgb(51, 65, 85)"
                strokeWidth={1}
              />
            );
          })}

          {/* Data polygon */}
          <path
            d={dataPath}
            fill="rgba(16, 185, 129, 0.2)"
            stroke="rgb(16, 185, 129)"
            strokeWidth={2}
          />

          {/* Data points */}
          {dataPoints.map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={point[0]}
              cy={point[1]}
              r={3}
              fill="rgb(16, 185, 129)"
            />
          ))}

          {/* Labels */}
          {dimensions.map((dim, i) => {
            const angle = i * angleStep;
            const [x, y] = polarToCartesian(angle, RADIUS + 20);
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-400 text-[11px]"
              >
                {dim.label}
              </text>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
TasteRadar.displayName = 'TasteRadar';
