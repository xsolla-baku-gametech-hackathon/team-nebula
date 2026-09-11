import { describe, expect, it } from 'vitest';
import { DescriptionValidationSchema, DiscoverInput } from '@/lib/domain/schemas';

const tag = (name: string, priority: 'required' | 'preferred' = 'required') =>
  ({ name, category: 'theme' as const, priority, basis: 'explicit' as const });

describe('description readiness', () => {
  it('accepts a confident description with grounded tags', () => {
    const result = DescriptionValidationSchema.parse({ status: 'ready', normalizedDescription: 'Co-op horror', confidence: 0.9,
      tags: [tag('Horror'), tag('Co-op')], mustHave: ['horror'], avoid: [], multiplayer: true, questions: [] });
    expect(result.status).toBe('ready');
  });

  it('requires clarification for weak descriptions', () => {
    const weak = { status: 'ready', normalizedDescription: 'Fun game', confidence: 0.4,
      tags: [tag('Fun')], mustHave: [], avoid: [], multiplayer: null, questions: [] };
    expect(DescriptionValidationSchema.safeParse(weak).success).toBe(false);
    expect(DescriptionValidationSchema.safeParse({ ...weak, status: 'needs_clarification', questions: ['What does the player do?'] }).success).toBe(true);
  });

  it('accepts at most three bounded clarification answers', () => {
    expect(DiscoverInput.parse({ query: 'fun game', clarifications: [{ question: 'Genre?', answer: 'Horror' }] }).clarifications).toHaveLength(1);
    expect(DiscoverInput.safeParse({ query: 'fun game', clarifications: Array(4).fill({ question: 'Q', answer: 'A' }) }).success).toBe(false);
  });
});
