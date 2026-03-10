import { z } from 'zod';

export const wishlistItemSchema = z.object({
  gameId: z.string().cuid(),
  targetPrice: z.number().positive().optional(),
  notifyOnSale: z.boolean().default(true),
});

export const wishlistItemUpdateSchema = wishlistItemSchema.partial().omit({ gameId: true });

export type WishlistItemInput = z.infer<typeof wishlistItemSchema>;
