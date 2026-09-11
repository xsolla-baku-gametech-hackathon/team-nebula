import { describe, expect, it } from 'vitest';
import { capTags, mergeTags, normalizeDiscoveryTags } from '@/lib/domain/discovery-tags';
import { DescriptionValidationSchema, type DescriptionValidation, type DiscoveryTag } from '@/lib/domain/schemas';

const FAILING_INPUT = '2d platformer scary game about being in an apartment that is AI generated and trying to escape it';

const tag = (
  name: string,
  category: DiscoveryTag['category'] = 'theme',
  priority: DiscoveryTag['priority'] = 'preferred',
  basis: DiscoveryTag['basis'] = 'inferred',
): DiscoveryTag => ({ name, category, priority, basis });

function ready(tags: DiscoveryTag[]): DescriptionValidation {
  return {
    status: 'ready', normalizedDescription: 'A side-scrolling horror escape game', confidence: 0.9,
    tags, mustHave: ['escape the apartment'], avoid: [], multiplayer: false, questions: [],
  };
}

const byName = (validation: DescriptionValidation) => validation.tags.map(item => item.name);
const find = (validation: DescriptionValidation, name: string) =>
  validation.tags.find(item => item.name === name);

describe('discovery tag normalization', () => {
  it('restores a stated genre the model dropped', () => {
    // Reproduces the reported bug: "apartment" kept, "Platformer" missing entirely.
    const result = normalizeDiscoveryTags(
      ready([tag('apartment', 'setting', 'required', 'explicit'), tag('escape', 'mechanic')]),
      FAILING_INPUT,
    );

    expect(find(result, 'Platformer')).toEqual({
      name: 'Platformer', category: 'genre', priority: 'required', basis: 'explicit',
    });
    expect(find(result, 'Horror')).toEqual({
      name: 'Horror', category: 'genre', priority: 'required', basis: 'explicit',
    });
    expect(find(result, 'apartment')?.category).toBe('setting');
    expect(byName(result)).toContain('escape');
  });

  it('recategorizes a genre the model filed elsewhere', () => {
    const result = normalizeDiscoveryTags(ready([
      tag('2D Platformer', 'mechanic', 'required', 'explicit'),
      tag('Horror', 'theme', 'required', 'explicit'),
    ]), 'a game');
    expect(find(result, 'Platformer')?.category).toBe('genre');
    expect(find(result, 'Horror')?.category).toBe('genre');
  });

  it('drops off-vocabulary genres but keeps off-vocabulary facets', () => {
    const result = normalizeDiscoveryTags(
      ready([tag('Vibe-Based Roguecrawler', 'genre'), tag('apartment', 'setting'), tag('dread', 'tone', 'required', 'explicit')]),
      'a game',
    );
    expect(byName(result)).not.toContain('Vibe-Based Roguecrawler');
    expect(byName(result)).toEqual(expect.arrayContaining(['apartment', 'dread']));
  });

  it('merges duplicates created by canonicalization, keeping the stronger claim', () => {
    const result = normalizeDiscoveryTags(
      ready([
        tag('2D Platformer', 'genre', 'preferred', 'inferred'),
        tag('platformer', 'genre', 'required', 'explicit'),
        tag('apartment', 'setting'),
      ]),
      'a game',
    );
    expect(byName(result).filter(name => name === 'Platformer')).toHaveLength(1);
    expect(find(result, 'Platformer')).toMatchObject({ priority: 'required', basis: 'explicit' });
  });

  it('keeps stated genres when the model already returned twelve tags', () => {
    const filler = Array.from({ length: 12 }, (_, index) => tag(`filler ${index}`, 'tone'));
    const result = normalizeDiscoveryTags(ready(filler), FAILING_INPUT);

    expect(result.tags).toHaveLength(12);
    expect(byName(result)).toEqual(expect.arrayContaining(['Platformer', 'Horror']));
    expect(byName(result).filter(name => name.startsWith('filler'))).toHaveLength(10);
  });

  it('always returns a schema-valid result', () => {
    const result = normalizeDiscoveryTags(ready([tag('apartment', 'setting', 'required', 'explicit')]), FAILING_INPUT);
    expect(DescriptionValidationSchema.safeParse(result).success).toBe(true);
  });

  it('falls back to the original rather than breaking a working request', () => {
    // Only off-vocabulary genres: normalization would empty the tag list and fail readiness.
    const original = ready([tag('Vibe-Based Roguecrawler', 'genre'), tag('Made-Up Genre', 'genre', 'required', 'explicit')]);
    expect(normalizeDiscoveryTags(original, 'a game about nothing in particular')).toEqual(original);
  });

  it('leaves clarification results untouched', () => {
    const clarify: DescriptionValidation = {
      status: 'needs_clarification', normalizedDescription: 'Fun game', confidence: 0.4,
      tags: [], mustHave: [], avoid: [], multiplayer: null, questions: ['What does the player do?'],
    };
    expect(normalizeDiscoveryTags(clarify, FAILING_INPUT)).toBe(clarify);
  });

  it('does not mutate its input', () => {
    const original = ready([tag('2D Platformer', 'mechanic')]);
    const snapshot = structuredClone(original);
    normalizeDiscoveryTags(original, FAILING_INPUT);
    expect(original).toEqual(snapshot);
  });
});

describe('tag merging and capping', () => {
  it('treats case and punctuation differences as one tag', () => {
    expect(mergeTags([tag('Online Co-Op'), tag('online co-op'), tag('ONLINE CO OP')])).toHaveLength(1);
  });

  it('drops the weakest claims first', () => {
    const kept = capTags([
      tag('weak', 'tone', 'preferred', 'inferred'),
      tag('strong', 'genre', 'required', 'explicit'),
    ], 1);
    expect(kept.map(item => item.name)).toEqual(['strong']);
  });
});
