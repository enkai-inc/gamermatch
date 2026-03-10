'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepGenres } from './step-genres';
import { StepMechanics } from './step-mechanics';
import { StepArtStyle } from './step-art-style';
import { StepDifficulty } from './step-difficulty';
import { StepSeedGames } from './step-seed-games';
import { StepPlatforms } from './step-platforms';

const STEP_TITLES = [
  'Genres',
  'Mechanics',
  'Art Style',
  'Difficulty',
  'Seed Games',
  'Platforms',
];

interface ProfileData {
  favoriteGenres: string[];
  preferredMechanics: string[];
  artStylePrefs: Record<string, number>;
  difficultyPref: string;
  sessionLength: string;
  seedGameTitles: string[];
  platformPrefs: string[];
}

interface WizardProps {
  initialStep?: number;
  initialData?: Partial<ProfileData>;
}

export function TasteProfileWizard({ initialStep = 0, initialData }: WizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    favoriteGenres: (initialData?.favoriteGenres as string[]) ?? [],
    preferredMechanics: (initialData?.preferredMechanics as string[]) ?? [],
    artStylePrefs: (initialData?.artStylePrefs as Record<string, number>) ?? {},
    difficultyPref: initialData?.difficultyPref ?? '',
    sessionLength: initialData?.sessionLength ?? '',
    seedGameTitles: (initialData?.seedGameTitles as string[]) ?? [],
    platformPrefs: (initialData?.platformPrefs as string[]) ?? [],
  });

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return profileData.favoriteGenres.length >= 1;
      case 1: return true; // optional
      case 2: return true; // sliders have defaults
      case 3: return profileData.difficultyPref !== '' && profileData.sessionLength !== '';
      case 4: return profileData.seedGameTitles.length >= 1;
      case 5: return profileData.platformPrefs.length >= 1;
      default: return false;
    }
  };

  const getStepData = (): Record<string, unknown> => {
    switch (currentStep) {
      case 0: return { favoriteGenres: profileData.favoriteGenres };
      case 1: return { preferredMechanics: profileData.preferredMechanics };
      case 2: return { artStylePrefs: profileData.artStylePrefs };
      case 3: return { difficultyPref: profileData.difficultyPref, sessionLength: profileData.sessionLength };
      case 4: return { seedGameTitles: profileData.seedGameTitles };
      case 5: return { platformPrefs: profileData.platformPrefs };
      default: return {};
    }
  };

  const saveStep = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/taste-profile/step', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: currentStep, data: getStepData() }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || 'Failed to save step');
        return false;
      }
      return true;
    } catch {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const saved = await saveStep();
    if (!saved) return;

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - complete the profile
      setSaving(true);
      try {
        const res = await fetch('/api/taste-profile/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const json = await res.json();
        if (json.success) {
          router.push('/dashboard');
        } else {
          setError(json.error?.message || 'Failed to complete profile');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercent = ((currentStep + 1) / 6) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Step {currentStep + 1} of 6: {STEP_TITLES[currentStep]}
          </span>
          <span className="text-slate-500">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step content */}
          {currentStep === 0 && (
            <StepGenres
              selected={profileData.favoriteGenres}
              onChange={(v) => setProfileData({ ...profileData, favoriteGenres: v })}
            />
          )}
          {currentStep === 1 && (
            <StepMechanics
              selected={profileData.preferredMechanics}
              onChange={(v) => setProfileData({ ...profileData, preferredMechanics: v })}
            />
          )}
          {currentStep === 2 && (
            <StepArtStyle
              values={profileData.artStylePrefs}
              onChange={(v) => setProfileData({ ...profileData, artStylePrefs: v })}
            />
          )}
          {currentStep === 3 && (
            <StepDifficulty
              difficulty={profileData.difficultyPref}
              sessionLength={profileData.sessionLength}
              onDifficultyChange={(v) => setProfileData({ ...profileData, difficultyPref: v })}
              onSessionLengthChange={(v) => setProfileData({ ...profileData, sessionLength: v })}
            />
          )}
          {currentStep === 4 && (
            <StepSeedGames
              selected={profileData.seedGameTitles}
              onChange={(v) => setProfileData({ ...profileData, seedGameTitles: v })}
            />
          )}
          {currentStep === 5 && (
            <StepPlatforms
              selected={profileData.platformPrefs}
              onChange={(v) => setProfileData({ ...profileData, platformPrefs: v })}
            />
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || saving}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || saving}
            >
              {saving
                ? 'Saving...'
                : currentStep === 5
                  ? 'Complete Profile'
                  : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
