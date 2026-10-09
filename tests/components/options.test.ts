import { describe, expect, it } from 'vitest';
import { GENRE_SUGGESTIONS } from '@/components/concept/options';
import { isCanonicalTag } from '@/lib/domain/tag-vocabulary';

describe('genre suggestions', () => {
  it('offers only canonical discovery tags', () => {
    expect(GENRE_SUGGESTIONS.filter(suggestion => !isCanonicalTag(suggestion))).toEqual([]);
  });

  it('offers the genres the reported failure needed', () => {
    expect(GENRE_SUGGESTIONS).toContain('Platformer');
    expect(GENRE_SUGGESTIONS).toContain('Horror');
  });

  it('has no duplicates', () => {
    expect(new Set(GENRE_SUGGESTIONS).size).toBe(GENRE_SUGGESTIONS.length);
  });
});
