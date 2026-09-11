/**
 * Fallback discovery functions when Grok is unavailable.
 * Uses keyword extraction for validation and tag-overlap for ranking.
 */

import type { Candidate, DescriptionValidation } from '@/lib/domain/schemas';

const GENRE_MAP: Record<string, string> = {
  horror: 'Horror', roguelike: 'Roguelike', rpg: 'RPG', platformer: 'Platformer',
  shooter: 'Shooter', strategy: 'Strategy', puzzle: 'Puzzle', simulation: 'Simulation',
  survival: 'Survival', adventure: 'Adventure', racing: 'Racing', sandbox: 'Sandbox',
  stealth: 'Stealth', 'tower defense': 'Tower Defense', metroidvania: 'Metroidvania',
};

const THEME_MAP: Record<string, string> = {
  'sci-fi': 'Sci-Fi', scifi: 'Sci-Fi', fantasy: 'Fantasy', underwater: 'Underwater',
  submarine: 'Underwater', space: 'Space', medieval: 'Medieval', 'post-apocalyptic': 'Post-Apocalyptic',
  psychological: 'Psychological', dark: 'Dark', comedy: 'Comedy',
};

const MECHANIC_MAP: Record<string, string> = {
  crafting: 'Crafting', 'base building': 'Base Building', procedural: 'Procedural',
  permadeath: 'Permadeath', stealth: 'Stealth', 'open world': 'Open World',
  'deck building': 'Deck Building', parkour: 'Parkour', 'bullet hell': 'Bullet Hell',
  exploration: 'Exploration',
};

const MODE_KEYWORDS: Record<string, { name: string; multiplayer: boolean }> = {
  'co-op': { name: 'Co-op', multiplayer: true }, coop: { name: 'Co-op', multiplayer: true },
  cooperative: { name: 'Co-op', multiplayer: true }, multiplayer: { name: 'Multiplayer', multiplayer: true },
  pvp: { name: 'PvP', multiplayer: true }, singleplayer: { name: 'Singleplayer', multiplayer: false },
  solo: { name: 'Singleplayer', multiplayer: false }, mmo: { name: 'MMO', multiplayer: true },
};

type TagCategory = 'genre' | 'theme' | 'mechanic' | 'mode' | 'perspective' | 'setting' | 'tone';

export function fallbackValidateDescription(
  query: string,
  _clarifications: { question: string; answer: string }[] = [],
): DescriptionValidation {
  const lower = query.toLowerCase();
  const tags: { name: string; category: TagCategory; priority: 'required' | 'preferred'; basis: 'explicit' | 'inferred' }[] = [];
  let multiplayer: boolean | null = null;

  for (const [kw, genre] of Object.entries(GENRE_MAP)) {
    if (lower.includes(kw)) tags.push({ name: genre, category: 'genre', priority: 'required', basis: 'explicit' });
  }
  for (const [kw, theme] of Object.entries(THEME_MAP)) {
    if (lower.includes(kw)) tags.push({ name: theme, category: 'theme', priority: 'preferred', basis: 'explicit' });
  }
  for (const [kw, mech] of Object.entries(MECHANIC_MAP)) {
    if (lower.includes(kw)) tags.push({ name: mech, category: 'mechanic', priority: 'preferred', basis: 'explicit' });
  }
  for (const [kw, mode] of Object.entries(MODE_KEYWORDS)) {
    if (lower.includes(kw)) {
      tags.push({ name: mode.name, category: 'mode', priority: 'required', basis: 'explicit' });
      multiplayer = mode.multiplayer;
    }
  }

  // Perspective
  if (lower.includes('first person') || lower.includes('first-person') || lower.includes('fps')) {
    tags.push({ name: 'First-Person', category: 'perspective', priority: 'preferred', basis: 'explicit' });
  } else if (lower.includes('third person') || lower.includes('third-person')) {
    tags.push({ name: 'Third-Person', category: 'perspective', priority: 'preferred', basis: 'explicit' });
  } else if (lower.includes('top down') || lower.includes('top-down')) {
    tags.push({ name: 'Top-Down', category: 'perspective', priority: 'preferred', basis: 'explicit' });
  }

  // Deduplicate
  const seen = new Set<string>();
  const uniqueTags = tags.filter(t => {
    const key = t.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);

  const hasRequired = uniqueTags.some(t => t.priority === 'required');
  const confidence = Math.min(0.9, 0.4 + uniqueTags.length * 0.1);
  const ready = uniqueTags.length >= 2 && hasRequired && confidence >= 0.65;

  const questions: string[] = [];
  if (!ready) {
    if (!uniqueTags.some(t => t.category === 'genre')) questions.push('What genre best describes your game?');
    if (!uniqueTags.some(t => t.category === 'mode')) questions.push('Is it single-player, co-op, or multiplayer?');
    if (uniqueTags.length < 2) questions.push('Can you describe the core gameplay loop in more detail?');
    // Schema requires at least one question when needs_clarification
    if (!questions.length) questions.push('Can you add more detail about the gameplay mechanics?');
  }

  return {
    status: ready ? 'ready' : 'needs_clarification',
    normalizedDescription: query.slice(0, 1000),
    confidence,
    tags: uniqueTags,
    mustHave: uniqueTags.filter(t => t.priority === 'required').map(t => t.name),
    avoid: [],
    multiplayer,
    questions: ready ? [] : questions.slice(0, 3),
  };
}

export function fallbackRankCandidates(
  validation: DescriptionValidation,
  candidates: Candidate[],
): { selections: { igdbId: number; reason: string; matchedTags: string[] }[] } {
  const scored = candidates.map(c => {
    const descWords = c.description.toLowerCase();
    const matched = validation.tags.filter(t => descWords.includes(t.name.toLowerCase())).map(t => t.name);
    const tagScore = matched.length / Math.max(validation.tags.length, 1);
    const score = c.semanticScore * 0.6 + tagScore * 0.4;
    return { igdbId: c.igdbId, score, reason: `Matched ${matched.length} tag(s) with ${(c.semanticScore * 100).toFixed(0)}% semantic similarity.`, matchedTags: matched };
  });

  const selections = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ igdbId, reason, matchedTags }) => ({ igdbId, reason, matchedTags }));

  return { selections };
}
