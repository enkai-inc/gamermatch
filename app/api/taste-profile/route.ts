import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, parseBody } from '@/lib/api-utils';
import { success, error, serverError } from '@/lib/api-response';
import { tasteProfileSchema } from '@/lib/validations/taste-profile';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;

    const profile = await db.tasteProfile.findUnique({
      where: { userId: authResult.userId },
    });

    return success(profile);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;

    const parsed = await parseBody(req, tasteProfileSchema);
    if ('error' in parsed) return parsed.error;

    const { data } = parsed;

    const profile = await db.tasteProfile.upsert({
      where: { userId: authResult.userId },
      create: {
        userId: authResult.userId,
        favoriteGenres: data.favoriteGenres,
        preferredMechanics: data.preferredMechanics ?? [],
        artStylePrefs: data.artStylePrefs ?? {},
        difficultyPref: data.difficultyPref ?? null,
        sessionLength: data.sessionLength ?? null,
        platformPrefs: data.platformPrefs ?? [],
        moodPreferences: data.moodPreferences ?? {},
        seedGameTitles: data.seedGameTitles ?? [],
        updatedAt: new Date(),
      },
      update: {
        favoriteGenres: data.favoriteGenres,
        preferredMechanics: data.preferredMechanics ?? [],
        artStylePrefs: data.artStylePrefs ?? {},
        difficultyPref: data.difficultyPref ?? null,
        sessionLength: data.sessionLength ?? null,
        platformPrefs: data.platformPrefs ?? [],
        moodPreferences: data.moodPreferences ?? {},
        seedGameTitles: data.seedGameTitles ?? [],
        updatedAt: new Date(),
      },
    });

    return success(profile);
  } catch (err) {
    console.error('Taste profile POST error:', err);
    return serverError();
  }
}
