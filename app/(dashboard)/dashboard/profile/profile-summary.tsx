'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileSummaryProps {
  profile: {
    favoriteGenres: unknown;
    preferredMechanics: unknown;
    artStylePrefs: unknown;
    difficultyPref: string | null;
    sessionLength: string | null;
    seedGameTitles: unknown;
    platformPrefs: unknown;
    completedAt: Date | null;
  };
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const router = useRouter();
  const genres = (profile.favoriteGenres as string[]) ?? [];
  const mechanics = (profile.preferredMechanics as string[]) ?? [];
  const platforms = (profile.platformPrefs as string[]) ?? [];
  const seedGames = (profile.seedGameTitles as string[]) ?? [];
  const artStyles = (profile.artStylePrefs as Record<string, number>) ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Profile completed {profile.completedAt ? new Date(profile.completedAt).toLocaleDateString() : ''}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/profile?edit=true')}
        >
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Favorite Genres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <Badge key={g}>{g}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferred Mechanics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mechanics.length > 0
                ? mechanics.map((m) => <Badge key={m} variant="secondary">{m}</Badge>)
                : <span className="text-sm text-slate-500">None selected</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Art Style Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(artStyles).map(([style, value]) => (
                <div key={style} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{style}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{value}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Play Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Difficulty</span>
                <span className="text-slate-200">{profile.difficultyPref ?? 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Session Length</span>
                <span className="text-slate-200">{profile.sessionLength ?? 'Not set'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seed Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {seedGames.length > 0
                ? seedGames.map((g) => <Badge key={g} variant="secondary">{g}</Badge>)
                : <span className="text-sm text-slate-500">None added</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <Badge key={p}>{p}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
