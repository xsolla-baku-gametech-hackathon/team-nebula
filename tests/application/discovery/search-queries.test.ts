import { describe, expect, it } from 'vitest';
import { buildSearchQueries } from '@/lib/application/discovery/search-queries';
import type { DescriptionValidation } from '@/lib/domain/schemas';

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

  it('puts a restored genre into the primary query', () => {
    // The tags are the retrieval query, so a dropped genre never reached IGDB at all.
    const validation: DescriptionValidation = { status: 'ready', normalizedDescription: 'A side-scrolling horror escape game', confidence: 0.9,
      tags: [
        { name: 'Platformer', category: 'genre', priority: 'required', basis: 'explicit' },
        { name: 'Horror', category: 'genre', priority: 'required', basis: 'explicit' },
        { name: 'apartment', category: 'setting', priority: 'preferred', basis: 'explicit' },
      ], mustHave: [], avoid: [], multiplayer: false, questions: [] };

    expect(buildSearchQueries(validation)[0]).toContain('Platformer');
    expect(buildSearchQueries(validation)[0]).toContain('Horror');
  });
});
