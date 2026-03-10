import { z } from 'zod';

export const tasteProfileStepSchema = z.object({
  step: z.number().min(0).max(5),
  data: z.record(z.string(), z.unknown()),
});

export const tasteProfileSchema = z.object({
  favoriteGenres: z.array(z.string()).min(1, 'Select at least one genre'),
  preferredMechanics: z.array(z.string()).optional(),
  artStylePrefs: z.record(z.string(), z.number().min(0).max(10)).optional(),
  difficultyPref: z.enum(['CASUAL', 'MODERATE', 'CHALLENGING', 'HARDCORE']).optional(),
  sessionLength: z.enum(['QUICK', 'MEDIUM', 'LONG', 'MARATHON']).optional(),
  platformPrefs: z.array(z.string()).optional(),
  moodPreferences: z.record(z.string(), z.number().min(0).max(10)).optional(),
  seedGameTitles: z.array(z.string()).optional(),
});

export type TasteProfileInput = z.infer<typeof tasteProfileSchema>;
