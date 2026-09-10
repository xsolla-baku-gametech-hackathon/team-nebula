import { z } from 'zod';

export const DiscoverInput = z.object({
  query: z.string().trim().min(3).max(2000),
  limit: z.number().int().min(1).max(10).default(10),
  clarifications: z.array(z.object({
    question: z.string().trim().min(1).max(500),
    answer: z.string().trim().min(1).max(1000),
  }).strict()).max(3).optional(),
}).strict();
export const IntentSchema = z.object({
  summary: z.string().min(1).max(500),
  searchQueries: z.array(z.string().min(3).max(500)).min(1).max(2),
  mustHave: z.array(z.string().min(1).max(150)).max(8),
  avoid: z.array(z.string().min(1).max(150)).max(8),
  multiplayer: z.boolean().nullable(),
});
export type DiscoveryIntent = z.infer<typeof IntentSchema>;
export type Candidate = { igdbId: number; name: string; description: string; context: string; gameModes: number[] };
export const RankingSchema = z.object({ selections: z.array(z.object({
  igdbId: z.number().int().positive(), reason: z.string().min(1).max(400),
})).max(20) });
export type Ranking = z.infer<typeof RankingSchema>;
export class DiscoveryError extends Error {
  constructor(public code: 'AI_NOT_CONFIGURED' | 'AI_UNAVAILABLE' | 'INVALID_AI_OUTPUT' | 'DISCOVERY_UNAVAILABLE', message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DiscoveryError';
  }
}
