import { describe, expect, it } from 'vitest';
import { buildSearchQueries } from '@/lib/discovery/search-queries';
import type { DescriptionValidation } from '@/lib/discovery/types';

describe('candidate search queries', () => {
  it('uses every validated tag across the queries', () => {
    const validation: DescriptionValidation = { status: 'ready', normalizedDescription: 'A haunted co-op investigation', confidence: 0.9,
      tags: [
        { name: 'Horror', category: 'theme', priority: 'required', basis: 'explicit' },
        { name: 'Online co-op', category: 'mode', priority: 'required', basis: 'explicit' },
        { name: 'Investigation', category: 'mechanic', priority: 'preferred', basis: 'inferred' },
      ], mustHave: ['horror'], avoid: [], multiplayer: true, questions: [] };
    const queries = buildSearchQueries(validation);
    expect(queries).toHaveLength(2);
    for (const tag of validation.tags) expect(queries.join(' ')).toContain(tag.name);
    expect(queries.every(query => query.length <= 500)).toBe(true);
  });
});
