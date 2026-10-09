import { describe, expect, it } from 'vitest';
import { rankCorpus } from '@/lib/application/discovery/rank-corpus';
import { tagOverlap } from '@/lib/infrastructure/corpus/search';
import { conceptHorrorCoop } from '@/tests/fixtures/concept.horror-coop';
import corpus from '@/data/games.json';
import type { NormalizedGame } from '@/lib/domain/types';

const template = corpus.games[0] as NormalizedGame;
function game(id: number, tags: string[]): NormalizedGame {
  return {
    ...template,
    identity: { ...template.identity, steamAppId: id },
    metadata: {
      ...template.metadata, tags, genres: [], themes: [], keywords: [], gameModes: [],
    },
    commercial: { ...template.commercial, priceUsd: { value: null, source: 'steam', estimated: false } },
  };
}

describe('hybrid corpus ranking versus tag matching', () => {
  it('ranks semantic relevance above a tag-only match', () => {
    const games = [game(1, ['Horror']), game(2, [])];
    const tags = [...games].sort((a, b) => tagOverlap(['Horror'], b.metadata.tags) - tagOverlap(['Horror'], a.metadata.tags));
    const ranked = rankCorpus(conceptHorrorCoop, games, new Float32Array([0, 1, 1, 0]), new Float32Array([1, 0]), 2, { limit: 2 });

    expect(tags[0].identity.steamAppId).toBe(1);
    expect(ranked[0].game.identity.steamAppId).toBe(2);
    expect(ranked[0].similarity.components.semantic).toBe(1);
    expect(ranked[1].similarity.components.semantic).toBe(0);
  });

  it('combines equal semantic evidence with structured genre evidence', () => {
    const games = [game(1, []), game(2, [])];
    games[0].metadata.genres = ['Strategy'];
    games[1].metadata.genres = ['Horror'];
    const ranked = rankCorpus(conceptHorrorCoop, games, new Float32Array([1, 0, 1, 0]), new Float32Array([1, 0]), 2, { limit: 2 });

    expect(ranked[0].game.identity.steamAppId).toBe(2);
    expect(ranked[0].similarity.score).not.toBe(ranked[1].similarity.score);
    expect(ranked[0].similarity.components.genre).toBe(0.6);
  });

  it.each([null, new Float32Array(2), new Float32Array([1]), new Float32Array([NaN, 0])])(
    'does not fabricate semantics for unavailable or invalid query vectors: %s', (query) => {
      const games = [game(1, ['Horror'])];
      games[0].metadata.genres = ['Horror'];
      const ranked = rankCorpus(conceptHorrorCoop, games, new Float32Array([1, 0]), query, 2, { limit: 1 });
      expect(ranked[0].similarity.components.semantic).toBeNull();
      expect(ranked[0].similarity.score).toBe(0.6);
      expect(ranked[0].similarity.rationale).toContain('Semantic evidence unavailable');
    },
  );

  it('does not interpret a missing corpus vector as a zero similarity match', () => {
    const ranked = rankCorpus(conceptHorrorCoop, [game(1, [])], new Float32Array(2), new Float32Array([1, 0]), 2, { limit: 1 });
    expect(ranked[0].similarity.components.semantic).toBeNull();
  });

  it('keeps original vector offsets after excluding a game', () => {
    const ranked = rankCorpus(conceptHorrorCoop, [game(1, []), game(2, [])], new Float32Array([0, 1, 1, 0]), new Float32Array([1, 0]), 2, { limit: 1, excludeAppIds: [1], includeAppIds: [2] });
    expect(ranked[0].game.identity.steamAppId).toBe(2);
    expect(ranked[0].similarity.components.semantic).toBe(1);
    expect(ranked[0].userAdded).toBe(true);
  });
});
