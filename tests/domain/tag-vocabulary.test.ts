import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CANONICAL_TAGS, GENRE_TAGS, canonicalTag, explicitGenreTags, isCanonicalTag, normalizeTagKey,
} from '@/lib/domain/tag-vocabulary';

const FAILING_INPUT = '2d platformer scary game about being in an apartment that is AI generated and trying to escape it';

describe('canonical tag vocabulary', () => {
  it('resolves names case- and punctuation-insensitively', () => {
    for (const spelling of ['Horror', 'horror', 'HORROR', ' horror ']) {
      expect(canonicalTag(spelling)).toEqual({ name: 'Horror', category: 'genre' });
    }
    for (const spelling of ['First-Person', 'first person', 'First_Person', 'FIRST  PERSON']) {
      expect(canonicalTag(spelling)?.name).toBe('First-Person');
    }
    expect(normalizeTagKey('Side-Scroller')).toBe('side scroller');
  });

  it('resolves the aliases behind the reported failure', () => {
    expect(canonicalTag('scary')).toEqual({ name: 'Horror', category: 'genre' });
    expect(canonicalTag('2d platformer')?.name).toBe('Platformer');
    expect(canonicalTag('side-scroller')?.name).toBe('Platformer');
    expect(canonicalTag('2D')).toEqual({ name: '2D', category: 'theme' });
  });

  it('reports unknown facets as off-vocabulary', () => {
    expect(canonicalTag('apartment')).toBeNull();
    expect(isCanonicalTag('apartment')).toBe(false);
    expect(isCanonicalTag('Platformer')).toBe(true);
  });

  it('keeps canonical names and aliases unambiguous', () => {
    const names = CANONICAL_TAGS.map(tag => normalizeTagKey(tag.name));
    expect(new Set(names).size).toBe(names.length);

    // Every registered term must resolve back to exactly one canonical tag.
    for (const tag of CANONICAL_TAGS) {
      expect(canonicalTag(tag.name)).toEqual(tag);
    }
    expect(GENRE_TAGS.every(tag => tag.category === 'genre')).toBe(true);
    expect(GENRE_TAGS.some(tag => tag.name === 'Platformer')).toBe(true);
  });

  it('covers every genre and tag the demo corpus already uses', () => {
    const corpus = JSON.parse(
      readFileSync(join(process.cwd(), 'data', 'games.json'), 'utf8'),
    ) as { games: { metadata: { genres: string[]; tags: string[] } }[] };

    const used = new Set(corpus.games.flatMap(game => [...game.metadata.genres, ...game.metadata.tags]));
    expect([...used].filter(name => !isCanonicalTag(name))).toEqual([]);
  });
});

describe('explicit genre detection', () => {
  it('finds every stated genre in first-occurrence order', () => {
    expect(explicitGenreTags(FAILING_INPUT).map(tag => tag.name)).toEqual(['Platformer', 'Horror']);
  });

  it('matches whole words and tolerates plurals', () => {
    expect(explicitGenreTags('AI generated art').map(tag => tag.name)).toEqual([]);
    expect(explicitGenreTags('a game about platformers').map(tag => tag.name)).toEqual(['Platformer']);
    expect(explicitGenreTags('strategic thinking').map(tag => tag.name)).toEqual([]);
  });

  it('prefers the longest overlapping genre', () => {
    expect(explicitGenreTags('a survival horror game').map(tag => tag.name)).toEqual(['Survival Horror']);
    expect(explicitGenreTags('a psychological horror walking simulator').map(tag => tag.name))
      .toEqual(['Psychological Horror', 'Walking Simulator']);
  });

  it('skips negated genres', () => {
    expect(explicitGenreTags('a horror game, not a platformer').map(tag => tag.name)).toEqual(['Horror']);
    expect(explicitGenreTags('no roguelike elements').map(tag => tag.name)).toEqual([]);
    expect(explicitGenreTags('without puzzles').map(tag => tag.name)).toEqual([]);
  });

  it('returns nothing for text with no stated genre', () => {
    expect(explicitGenreTags('a game about an apartment')).toEqual([]);
    expect(explicitGenreTags('')).toEqual([]);
  });
});
