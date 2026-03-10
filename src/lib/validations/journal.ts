import { z } from 'zod';

export const journalEntrySchema = z.object({
  gameId: z.string().cuid(),
  rating: z.number().min(1).max(10).optional(),
  status: z.enum(['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED', 'ON_HOLD']).default('BACKLOG'),
  hoursPlayed: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});

export const journalEntryUpdateSchema = journalEntrySchema.partial().omit({ gameId: true });

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
