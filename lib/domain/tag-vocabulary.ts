import type { DiscoveryTag } from './schemas';

/**
 * Canonical discovery-tag vocabulary.
 *
 * Curated from the Steam store genre list plus the sub-genre, mode, perspective,
 * theme and mechanic terms developers actually write in a pitch. Every distinct
 * `metadata.genres` and `metadata.tags` value in `data/games.json` resolves here,
 * which is what `tests/domain/tag-vocabulary.test.ts` enforces.
 *
 * Only the `genre` category is a closed set. Other categories accept free-form
 * facets — see `docs/backend-reference/tag-semantics.md`.
 */

export type TagCategory = DiscoveryTag['category'];
export type CanonicalTag = { readonly name: string; readonly category: TagCategory };
type VocabularyEntry = CanonicalTag & { readonly aliases?: readonly string[] };

/** Lowercases and collapses every run of non-alphanumeric characters to one space. */
export function normalizeTagKey(name: string): string {
  return name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const VOCABULARY: readonly VocabularyEntry[] = [
  // ── Genres ───────────────────────────────────────────────────────
  { name: 'Action', category: 'genre' },
  { name: 'Adventure', category: 'genre' },
  { name: 'Casual', category: 'genre' },
  { name: 'Indie', category: 'genre' },
  { name: 'RPG', category: 'genre', aliases: ['role playing', 'role playing game', 'roleplaying'] },
  { name: 'Shooter', category: 'genre' },
  { name: 'FPS', category: 'genre', aliases: ['first person shooter'] },
  { name: 'Third-Person Shooter', category: 'genre' },
  { name: 'Platformer', category: 'genre', aliases: ['2d platformer', '3d platformer', 'side scroller', 'sidescroller', 'platforming', '2d platforming', '3d platforming', 'platform game'] },
  { name: 'Metroidvania', category: 'genre' },
  { name: 'Horror', category: 'genre', aliases: ['scary', 'spooky', 'creepy', 'frightening', 'terrifying'] },
  { name: 'Survival Horror', category: 'genre' },
  { name: 'Psychological Horror', category: 'genre' },
  { name: 'Survival', category: 'genre' },
  { name: 'Strategy', category: 'genre' },
  { name: 'Tactical', category: 'genre' },
  { name: 'Simulation', category: 'genre', aliases: ['simulator', 'sim'] },
  { name: 'Immersive Sim', category: 'genre' },
  { name: 'Walking Simulator', category: 'genre' },
  { name: 'Puzzle', category: 'genre' },
  { name: 'Racing', category: 'genre', aliases: ['driving'] },
  { name: 'Fighting', category: 'genre', aliases: ['beat em up'] },
  { name: 'Sports', category: 'genre' },
  { name: 'Roguelike', category: 'genre', aliases: ['rogue like'] },
  { name: 'Roguelite', category: 'genre', aliases: ['rogue lite'] },
  { name: 'Souls-like', category: 'genre', aliases: ['soulslike'] },
  { name: 'Battle Royale', category: 'genre' },
  { name: 'Visual Novel', category: 'genre' },
  { name: 'Interactive Fiction', category: 'genre' },
  { name: 'Bullet Hell', category: 'genre', aliases: ['shmup', 'danmaku', 'shoot em up'] },
  { name: 'Tower Defense', category: 'genre', aliases: ['tower defence'] },
  { name: 'Deckbuilder', category: 'genre', aliases: ['deck builder', 'deck building', 'deckbuilding'] },
  { name: 'Card Game', category: 'genre' },
  { name: 'Social Deduction', category: 'genre' },
  { name: 'Sandbox', category: 'genre' },
  { name: 'MOBA', category: 'genre' },
  { name: 'Idle', category: 'genre', aliases: ['incremental', 'clicker'] },
  { name: 'Rhythm', category: 'genre', aliases: ['music game'] },

  // ── Modes ────────────────────────────────────────────────────────
  { name: 'Singleplayer', category: 'mode', aliases: ['single player', 'solo'] },
  { name: 'Multiplayer', category: 'mode', aliases: ['multi player'] },
  { name: 'Co-op', category: 'mode', aliases: ['coop', 'cooperative'] },
  { name: 'Online Co-Op', category: 'mode', aliases: ['online coop'] },
  { name: 'Local Co-Op', category: 'mode', aliases: ['local coop', 'couch co op', 'couch coop'] },
  { name: 'PvP', category: 'mode', aliases: ['player versus player'] },
  { name: 'PvE', category: 'mode' },
  { name: 'MMO', category: 'mode', aliases: ['mmorpg', 'massively multiplayer'] },
  { name: 'Split Screen', category: 'mode', aliases: ['splitscreen'] },

  // ── Perspectives ─────────────────────────────────────────────────
  { name: 'First-Person', category: 'perspective', aliases: ['1st person'] },
  { name: 'Third-Person', category: 'perspective', aliases: ['3rd person'] },
  { name: 'Isometric', category: 'perspective' },
  { name: 'Top-Down', category: 'perspective', aliases: ['topdown'] },
  { name: 'Side View', category: 'perspective' },
  { name: 'VR', category: 'perspective', aliases: ['virtual reality'] },

  // ── Mechanics ────────────────────────────────────────────────────
  { name: 'Crafting', category: 'mechanic' },
  { name: 'Exploration', category: 'mechanic' },
  { name: 'Permadeath', category: 'mechanic', aliases: ['perma death'] },
  { name: 'Procedural Generation', category: 'mechanic', aliases: ['procedural', 'procedurally generated'] },
  { name: 'Base Building', category: 'mechanic' },
  { name: 'Open World', category: 'mechanic' },
  { name: 'Stealth', category: 'mechanic' },
  { name: 'Parkour', category: 'mechanic' },
  { name: 'Resource Management', category: 'mechanic' },
  { name: 'Turn-Based', category: 'mechanic' },
  { name: 'Real-Time', category: 'mechanic' },
  { name: 'Physics', category: 'mechanic' },
  { name: 'Character Customization', category: 'mechanic' },

  // ── Themes ───────────────────────────────────────────────────────
  { name: '2D', category: 'theme', aliases: ['two dimensional'] },
  { name: '3D', category: 'theme', aliases: ['three dimensional'] },
  { name: 'Pixel Graphics', category: 'theme', aliases: ['pixel art', 'pixelart'] },
  { name: 'Hand-drawn', category: 'theme', aliases: ['handdrawn'] },
  { name: 'Low-poly', category: 'theme', aliases: ['lowpoly'] },
  { name: 'Retro', category: 'theme' },
  { name: 'Anime', category: 'theme' },
  { name: 'Sci-Fi', category: 'theme', aliases: ['scifi', 'science fiction'] },
  { name: 'Fantasy', category: 'theme' },
  { name: 'Dark Fantasy', category: 'theme' },
  { name: 'Cyberpunk', category: 'theme' },
  { name: 'Post-apocalyptic', category: 'theme', aliases: ['postapocalyptic'] },
  { name: 'Supernatural', category: 'theme' },
  { name: 'Lovecraftian', category: 'theme', aliases: ['cosmic horror'] },
  { name: 'Zombies', category: 'theme', aliases: ['zombie'] },
  { name: 'Mystery', category: 'theme' },
  { name: 'Historical', category: 'theme' },
  { name: 'Military', category: 'theme' },
  { name: 'Western', category: 'theme' },
  { name: 'Medieval', category: 'theme' },

  // ── Settings ─────────────────────────────────────────────────────
  { name: 'Space', category: 'setting' },
  { name: 'Underwater', category: 'setting' },
  { name: 'Submarine', category: 'setting' },
  { name: 'Haunted House', category: 'setting' },
  { name: 'Urban', category: 'setting' },
  { name: 'Wilderness', category: 'setting' },

  // ── Tones ────────────────────────────────────────────────────────
  { name: 'Atmospheric', category: 'tone' },
  { name: 'Difficult', category: 'tone', aliases: ['hard', 'challenging', 'brutal'] },
  { name: 'Funny', category: 'tone', aliases: ['comedy', 'humorous', 'humor'] },
  { name: 'Relaxing', category: 'tone', aliases: ['chill', 'cozy'] },
  { name: 'Dark', category: 'tone' },
  { name: 'Emotional', category: 'tone' },
  { name: 'Minimalist', category: 'tone' },
  { name: 'Story Rich', category: 'tone', aliases: ['story driven', 'narrative driven'] },
];

export const CANONICAL_TAGS: readonly CanonicalTag[] =
  VOCABULARY.map(({ name, category }) => ({ name, category }));

export const GENRE_TAGS: readonly CanonicalTag[] =
  CANONICAL_TAGS.filter(tag => tag.category === 'genre');

const BY_KEY: ReadonlyMap<string, CanonicalTag> = new Map(
  VOCABULARY.flatMap(entry => {
    const tag: CanonicalTag = { name: entry.name, category: entry.category };
    return [entry.name, ...(entry.aliases ?? [])].map(term => [normalizeTagKey(term), tag] as const);
  }),
);

/** Resolves a free-text tag name to its canonical form, or null when unknown. */
export function canonicalTag(name: string): CanonicalTag | null {
  return BY_KEY.get(normalizeTagKey(name)) ?? null;
}

export function isCanonicalTag(name: string): boolean {
  return BY_KEY.has(normalizeTagKey(name));
}

/** Terms that negate a following genre, so "not a platformer" injects nothing. */
const NEGATORS = new Set(['not', 'no', 'non', 'without', 'isnt', 'isn', 'never', 'except', 'excluding', 'exclude', 'avoid']);
const NEGATION_WINDOW = 3;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const GENRE_PATTERNS: readonly { readonly tag: CanonicalTag; readonly pattern: RegExp }[] =
  VOCABULARY.filter(entry => entry.category === 'genre').flatMap(entry => {
    const tag: CanonicalTag = { name: entry.name, category: entry.category };
    return [entry.name, ...(entry.aliases ?? [])].map(term => ({
      tag,
      pattern: new RegExp(`(?:^| )${escapeRegExp(normalizeTagKey(term))}s?(?= |$)`, 'g'),
    }));
  });

function negated(haystack: string, matchStart: number): boolean {
  const preceding = haystack.slice(0, matchStart).trim().split(' ').filter(Boolean);
  return preceding.slice(-NEGATION_WINDOW).some(word => NEGATORS.has(word));
}

/**
 * Finds every genre named explicitly in free text, in first-occurrence order.
 *
 * Matching is word-boundary aware (so "generated" never matches a genre), tolerates
 * plurals, skips negated mentions, and drops a genre whose match sits entirely inside
 * a longer one — "survival horror game" yields Survival Horror, not three genres.
 */
export function explicitGenreTags(text: string): CanonicalTag[] {
  const haystack = ` ${normalizeTagKey(text)} `;
  const spans = new Map<string, { tag: CanonicalTag; start: number; end: number }>();

  for (const { tag, pattern } of GENRE_PATTERNS) {
    pattern.lastIndex = 0;
    for (let match = pattern.exec(haystack); match; match = pattern.exec(haystack)) {
      const start = match.index + (match[0].startsWith(' ') ? 1 : 0);
      if (negated(haystack, start)) continue;
      const span = { tag, start, end: start + match[0].trimStart().length };
      const existing = spans.get(tag.name);
      if (!existing || span.start < existing.start || (span.start === existing.start && span.end > existing.end)) {
        spans.set(tag.name, span);
      }
    }
  }

  const found = [...spans.values()];
  return found
    .filter(span => !found.some(other =>
      other.tag.name !== span.tag.name && other.start <= span.start && other.end >= span.end))
    .sort((a, b) => a.start - b.start)
    .map(span => span.tag);
}
