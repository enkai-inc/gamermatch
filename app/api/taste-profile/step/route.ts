import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth, parseBody } from '@/lib/api-utils';
import { success, serverError, validationError } from '@/lib/api-response';
import { tasteProfileStepSchema } from '@/lib/validations/taste-profile';
import { DifficultyLevel, SessionLength } from '@prisma/client';

const stepDataSchemas: Record<number, z.ZodSchema> = {
  0: z.object({ favoriteGenres: z.array(z.string()).min(1, 'Select at least one genre') }),
  1: z.object({ preferredMechanics: z.array(z.string()) }),
  2: z.object({ artStylePrefs: z.record(z.string(), z.number().min(1).max(10)) }),
  3: z.object({
    difficultyPref: z.nativeEnum(DifficultyLevel),
    sessionLength: z.nativeEnum(SessionLength),
  }),
  4: z.object({ seedGameTitles: z.array(z.string()).min(1).max(5) }),
  5: z.object({ platformPrefs: z.array(z.string()).min(1, 'Select at least one platform') }),
};

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;

    const parsed = await parseBody(req, tasteProfileStepSchema);
    if ('error' in parsed) return parsed.error;

    const { step, data } = parsed.data;

    const stepSchema = stepDataSchemas[step];
    if (!stepSchema) {
      return validationError(`Invalid step number: ${step}`);
    }

    const stepParsed = stepSchema.safeParse(data);
    if (!stepParsed.success) {
      return validationError(stepParsed.error.flatten());
    }

    const stepData = stepParsed.data as Record<string, unknown>;

    // Ensure profile exists
    await db.tasteProfile.upsert({
      where: { userId: authResult.userId },
      create: { userId: authResult.userId },
      update: {},
    });

    // Build update payload from step data
    const updateData: Record<string, unknown> = {
      ...stepData,
      currentStep: step + 1,
      updatedAt: new Date(),
    };

    const profile = await db.tasteProfile.update({
      where: { userId: authResult.userId },
      data: updateData,
    });

    return success(profile);
  } catch (err) {
    console.error('Taste profile step PATCH error:', err);
    return serverError();
  }
}
