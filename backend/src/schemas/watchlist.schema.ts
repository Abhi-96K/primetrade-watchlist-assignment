import { z } from 'zod';

export const createWatchlistItemSchema = z.object({
  symbol: z.string().min(1, 'Coin/Token Symbol is required').toUpperCase(),
  name: z.string().min(1, 'Coin Name is required'),
  amount: z.number().positive('Amount must be positive'),
  purchasePrice: z.number().nonnegative('Purchase price cannot be negative'),
  note: z.string().max(500, 'Note must not exceed 500 characters').optional().nullable(),
});

export const updateWatchlistItemSchema = z.object({
  symbol: z.string().min(1).toUpperCase().optional(),
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  purchasePrice: z.number().nonnegative().optional(),
  note: z.string().max(500).optional().nullable(),
});

export type CreateWatchlistItemInput = z.infer<typeof createWatchlistItemSchema>;
export type UpdateWatchlistItemInput = z.infer<typeof updateWatchlistItemSchema>;
