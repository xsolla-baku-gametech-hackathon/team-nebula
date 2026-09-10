import { z } from 'zod';

export const DiscoveryTagSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(['genre', 'theme', 'mechanic', 'mode', 'perspective', 'setting', 'tone']),
  priority: z.enum(['required', 'preferred']),
  basis: z.enum(['explicit', 'inferred']),
}).strict();
export type DiscoveryTag = z.infer<typeof DiscoveryTagSchema>;
export const DescriptionValidationSchema = z.object({
  status: z.enum(['ready', 'needs_clarification']),
  normalizedDescription: z.string().trim().min(1).max(1000),
  confidence: z.number().min(0).max(1),
  tags: z.array(DiscoveryTagSchema).max(12),
  mustHave: z.array(z.string().trim().min(1).max(150)).max(8),
  avoid: z.array(z.string().trim().min(1).max(150)).max(8),
  multiplayer: z.boolean().nullable(),
  questions: z.array(z.string().trim().min(1).max(500)).max(3),
}).strict().superRefine((value, context) => {
  const uniqueTags = new Set(value.tags.map(tag => tag.name.toLocaleLowerCase()));
  if (uniqueTags.size !== value.tags.length) context.addIssue({ code: 'custom', path: ['tags'], message: 'Tags must be unique' });
  if (value.status === 'ready') {
    if (value.confidence < 0.65) context.addIssue({ code: 'custom', path: ['confidence'], message: 'Ready descriptions require 0.65 confidence' });
    if (value.tags.length < 2) context.addIssue({ code: 'custom', path: ['tags'], message: 'Ready descriptions require two tags' });
    if (!value.tags.some(tag => tag.priority === 'required')) context.addIssue({ code: 'custom', path: ['tags'], message: 'Ready descriptions require a required tag' });
    if (value.questions.length) context.addIssue({ code: 'custom', path: ['questions'], message: 'Ready descriptions cannot have questions' });
  } else if (!value.questions.length) context.addIssue({ code: 'custom', path: ['questions'], message: 'Clarification requires a question' });
});
export type DescriptionValidation = z.infer<typeof DescriptionValidationSchema>;

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
