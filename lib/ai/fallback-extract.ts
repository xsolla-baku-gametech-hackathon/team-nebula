import type { GameConcept, ConceptField, GameMode, Perspective, Platform } from '@/lib/types';

const GENRE_KEYWORDS: Record<string, string> = {
  'horror': 'Horror', 'roguelike': 'Roguelike', 'rpg': 'RPG', 'platformer': 'Platformer',
  'shooter': 'Shooter', 'strategy': 'Strategy', 'puzzle': 'Puzzle', 'simulation': 'Simulation',
  'survival': 'Survival', 'adventure': 'Adventure', 'racing': 'Racing', 'fighting': 'Fighting',
  'stealth': 'Stealth', 'sandbox': 'Sandbox', 'tower defense': 'Tower Defense',
  'visual novel': 'Visual Novel', 'metroidvania': 'Metroidvania',
};

const MECHANIC_KEYWORDS = [
  'permadeath', 'crafting', 'base building', 'deck building', 'turn-based', 'real-time',
  'proximity voice', 'session-based', 'procedural', 'open world', 'parkour', 'stealth',
  'co-op', 'pvp', 'battle royale', 'looter', 'souls-like', 'bullet hell',
];

const MODE_MAP: Record<string, GameMode> = {
  'singleplayer': 'Singleplayer', 'single player': 'Singleplayer', 'solo': 'Singleplayer',
  'co-op': 'Online Co-op', 'coop': 'Online Co-op', 'cooperative': 'Online Co-op',
  'local co-op': 'Local Co-op', 'couch co-op': 'Local Co-op',
  'pvp': 'Online PvP', 'multiplayer': 'Online Co-op', 'mmo': 'MMO',
};

const PERSPECTIVE_MAP: Record<string, Perspective> = {
  'first person': 'First person', 'first-person': 'First person', 'fps': 'First person',
  'third person': 'Third person', 'third-person': 'Third person', 'tps': 'Third person',
  'isometric': 'Isometric', 'top down': 'Top down', 'top-down': 'Top down',
  'side view': 'Side view', 'side-scrolling': 'Side view', '2d': 'Side view',
};

export function fallbackExtract(text: string): { concept: GameConcept; questions: { field: ConceptField; question: string; suggestions?: string[]; skippable: true }[] } {
  const lower = text.toLowerCase();

  const genres: string[] = [];
  for (const [kw, genre] of Object.entries(GENRE_KEYWORDS)) {
    if (lower.includes(kw)) genres.push(genre);
  }

  const mechanics: string[] = [];
  for (const m of MECHANIC_KEYWORDS) {
    if (lower.includes(m)) mechanics.push(m);
  }

  const modes: GameMode[] = [];
  for (const [kw, mode] of Object.entries(MODE_MAP)) {
    if (lower.includes(kw) && !modes.includes(mode)) modes.push(mode);
  }

  let perspective: Perspective | null = null;
  for (const [kw, p] of Object.entries(PERSPECTIVE_MAP)) {
    if (lower.includes(kw)) { perspective = p; break; }
  }

  const priceMatch = lower.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  const priceUsd = priceMatch ? parseFloat(priceMatch[1]) : null;

  const dateMatch = lower.match(/(?:q[1-4]\s*20\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*20\d{2}|\d{1,2}\s+\w+\s*,?\s*20\d{2})/i);
  const plannedRelease = dateMatch ? dateMatch[0] : null;

  const platforms: Platform[] = [];
  if (lower.includes('pc') || lower.includes('steam') || lower.includes('windows')) platforms.push('PC');
  if (lower.includes('switch')) platforms.push('Switch');
  if (lower.includes('ps5') || lower.includes('playstation')) platforms.push('PS5');
  if (lower.includes('xbox')) platforms.push('Xbox');

  const missingImportantFields: ConceptField[] = [];
  if (genres.length === 0) missingImportantFields.push('primaryGenre');
  if (mechanics.length < 2) missingImportantFields.push('mechanics');
  if (modes.length === 0) missingImportantFields.push('gameModes');
  if (!perspective) missingImportantFields.push('perspective');
  if (!priceUsd) missingImportantFields.push('priceUsd');
  if (!plannedRelease) missingImportantFields.push('plannedRelease');

  const concept: GameConcept = {
    version: 1,
    concept: {
      title: null,
      shortDescription: text.slice(0, 300),
      rawText: text,
      platforms: platforms.length > 0 ? platforms : ['PC'],
      targetSteam: true,
    },
    taxonomy: {
      primaryGenre: genres[0] ?? null,
      secondaryGenres: genres.slice(1),
      themes: [],
      mechanics,
      gameModes: modes.length > 0 ? modes : ['Singleplayer'],
      perspective,
    },
    commercial: {
      priceUsd,
      plannedRelease,
      teamSize: null,
      isFirstTitle: null,
    },
    confidence: {
      primaryGenre: genres.length > 0 ? 0.4 : 0,
      mechanics: mechanics.length >= 2 ? 0.3 : 0.1,
      gameModes: modes.length > 0 ? 0.4 : 0.1,
      perspective: perspective ? 0.4 : 0,
      priceUsd: priceUsd ? 0.4 : 0,
      plannedRelease: plannedRelease ? 0.3 : 0,
    },
    missingImportantFields,
  };

  const questions: { field: ConceptField; question: string; suggestions?: string[]; skippable: true }[] = [];
  if (!genres[0]) questions.push({ field: 'primaryGenre', question: "What's the primary genre?", suggestions: ['Horror', 'RPG', 'Shooter', 'Platformer', 'Strategy', 'Survival'], skippable: true });
  if (modes.length === 0) questions.push({ field: 'gameModes', question: "How many players? (solo, co-op, multiplayer)", suggestions: ['Singleplayer', 'Online Co-op', 'Local Co-op', 'Online PvP', 'MMO'], skippable: true });
  if (!perspective) questions.push({ field: 'perspective', question: "What's the camera perspective?", suggestions: ['First person', 'Third person', 'Isometric', 'Top down', 'Side view'], skippable: true });
  if (mechanics.length < 2) questions.push({ field: 'mechanics', question: "What are the core mechanics? (e.g. crafting, stealth, permadeath, procedural)", skippable: true });
  if (!priceUsd) questions.push({ field: 'priceUsd', question: "What's your target price point?", suggestions: ['$4.99', '$9.99', '$14.99', '$19.99', '$29.99'], skippable: true });
  if (!plannedRelease) questions.push({ field: 'plannedRelease', question: "When are you planning to release?", suggestions: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'], skippable: true });

  return { concept, questions };
}
