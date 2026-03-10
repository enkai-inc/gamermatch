import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { TasteProfileWizard } from '@/components/taste-profile/wizard';
import { ProfileSummary } from './profile-summary';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const profile = await db.tasteProfile.findUnique({
    where: { userId: session.user.id },
  });

  const isComplete = profile?.completedAt !== null && profile?.completedAt !== undefined;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-100">Taste Profile</h1>
      {isComplete ? (
        <ProfileSummary profile={profile} />
      ) : (
        <TasteProfileWizard
          initialStep={profile?.currentStep ?? 0}
          initialData={
            profile
              ? {
                  favoriteGenres: (profile.favoriteGenres as string[]) ?? [],
                  preferredMechanics: (profile.preferredMechanics as string[]) ?? [],
                  artStylePrefs: (profile.artStylePrefs as Record<string, number>) ?? {},
                  difficultyPref: profile.difficultyPref ?? '',
                  sessionLength: profile.sessionLength ?? '',
                  seedGameTitles: (profile.seedGameTitles as string[]) ?? [],
                  platformPrefs: (profile.platformPrefs as string[]) ?? [],
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
