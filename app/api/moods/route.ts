import { NextResponse } from 'next/server';

const MOODS = [
  {
    id: 'RELAXING',
    name: 'Relaxing Evening',
    description: 'Wind down with calm, story-rich games',
    icon: 'Moon',
  },
  {
    id: 'COMPETITIVE',
    name: 'Competitive Edge',
    description: 'Test your skills in intense matches',
    icon: 'Swords',
  },
  {
    id: 'SOCIAL',
    name: 'Social Gaming',
    description: 'Play with friends and connect',
    icon: 'Users',
  },
  {
    id: 'ADVENTURE',
    name: 'Epic Adventure',
    description: 'Dive into immersive worlds',
    icon: 'Map',
  },
  {
    id: 'CREATIVE',
    name: 'Creative Mode',
    description: 'Build, craft, and create',
    icon: 'Paintbrush',
  },
  {
    id: 'QUICK_FUN',
    name: 'Quick Fun',
    description: 'Pick-up-and-play in 15-30 minutes',
    icon: 'Zap',
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: MOODS });
}
