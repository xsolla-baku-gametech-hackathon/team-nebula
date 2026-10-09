/**
 * Optional signals users can add before concept validation.
 *
 * Every entry must be a canonical discovery tag, so a suggestion chip can never
 * inject a term the normalizer would then treat as a free-form facet.
 * `tests/components/options.test.ts` enforces that.
 */
export const GENRE_SUGGESTIONS = [
  'Platformer',
  'Horror',
  'Psychological Horror',
  'Survival',
  'Roguelike',
  'Atmospheric',
  'Co-op',
  'Multiplayer',
  'First-Person',
  'Indie',
] as const;
