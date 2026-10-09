import { describe, expect, it } from 'vitest';
import { fallbackExtract } from '@/lib/application/concept/fallback-extract';

const FAILING_INPUT = '2d platformer scary game about being in an apartment that is AI generated and trying to escape it';

describe('keyword concept fallback', () => {
  it('extracts stated genres through the shared vocabulary', () => {
    const { concept } = fallbackExtract(FAILING_INPUT);
    expect(concept.taxonomy.primaryGenre).toBe('Platformer');
    expect(concept.taxonomy.secondaryGenres).toContain('Horror');
    expect(concept.missingImportantFields).not.toContain('primaryGenre');
  });

  it('resolves aliases the old keyword map missed', () => {
    // Primary genre follows first occurrence, so "scary" leads and "side-scroller" follows.
    const scroller = fallbackExtract('a scary side-scroller').concept.taxonomy;
    expect(scroller.primaryGenre).toBe('Horror');
    expect(scroller.secondaryGenres).toContain('Platformer');

    expect(fallbackExtract('a side-scroller that is scary').concept.taxonomy.primaryGenre).toBe('Platformer');
    expect(fallbackExtract('a spooky deckbuilding game').concept.taxonomy.secondaryGenres).toContain('Deckbuilder');
  });

  it('still reports a missing genre when none is stated', () => {
    const { concept, questions } = fallbackExtract('a game about an apartment');
    expect(concept.taxonomy.primaryGenre).toBeNull();
    expect(concept.missingImportantFields).toContain('primaryGenre');
    expect(questions.map(question => question.field)).toContain('primaryGenre');
  });

  it('keeps the non-genre extraction it already did', () => {
    const { concept } = fallbackExtract('a co-op crafting survival game on PC for $19.99 in Q3 2026');
    expect(concept.taxonomy.gameModes).toContain('Online Co-op');
    expect(concept.taxonomy.mechanics).toContain('crafting');
    expect(concept.concept.platforms).toContain('PC');
    expect(concept.commercial.priceUsd).toBe(19.99);
    expect(concept.commercial.plannedRelease).toBe('q3 2026');
  });
});
