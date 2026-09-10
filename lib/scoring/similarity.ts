/**
 * This script is used to calculate similarity between user concept and candidate games.
 */


import type { GameConcept, NormalizedGame, ScoredCompetitor, SimilarityComponents, Driver } from '@/lib/types';
import { driver } from './drivers';

/** Semantic match dominates: description-over-tags is the core claim. */
const W_SEMANTIC = 0.40;
const W_MECHANICS = 0.20;
const W_GENRE = 0.15;
const W_THEME = 0.10;
const W_GAME_MODE = 0.10;
const W_PRICE = 0.05;

type ComponentEntry = { name: string; weight: number; value: number; available: boolean };

/**
 * Computes the Jaccard similarity between two string sets.
 *
 * It measures overlap as the size of the intersection divided by the size of the union,
 * so it returns a value between 0 and 1 where 1 means the sets are identical and 0 means
 * they have no shared terms. This is used for comparing gameplay tags, mechanics, themes,
 * and game modes while ignoring duplicate values and case differences.
 */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a.map(s => s.toLowerCase()));
  const setB = new Set(b.map(s => s.toLowerCase()));
  let intersection = 0;
  for (const v of setA) if (setB.has(v)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function priceComponent(conceptPrice: number | null, gamePrice: number | null): number {
  if (conceptPrice === null || gamePrice === null) return 0.5;
  return Math.max(0, 1 - Math.min(1, Math.abs(conceptPrice - gamePrice) / 20));
}

function genreScore(concept: GameConcept, game: NormalizedGame): number {
  const primary = concept.taxonomy.primaryGenre?.toLowerCase();
  const gameGenres = game.metadata.genres.map(g => g.toLowerCase());
  if (!primary) return 0;

  let score = 0;
  if (gameGenres.includes(primary)) score += 0.6;

  const secondary = concept.taxonomy.secondaryGenres.map(g => g.toLowerCase());
  const n = secondary.length || 1;
  for (const g of secondary) {
    if (gameGenres.includes(g)) score += 0.4 / n;
  }

  return Math.min(1, score);
}

/**
 * Combines a semantic embedding match with several structured metadata signals to score how similar
 * a game's concept is to a candidate comparable.
 *
 * The algorithm weights the strongest factors most heavily: semantic match (40%), mechanics (20%),
 * genre (15%), theme (10%), game mode (10%), and price (5%). Each component is normalized to a 0–1
 * value, and the weighted score is averaged across the active factors to produce a final similarity
 * score out of 100. The function also returns the per-component values, an explanation of the strongest
 * matching drivers, and a short rationale string for UI display.
 */
export function scoreSimilarity(
  concept: GameConcept,
  game: NormalizedGame,
  semanticScore: number,
): { score: number; components: SimilarityComponents; drivers: Driver[]; rationale: string } {
  const mechanics = jaccard(concept.taxonomy.mechanics, game.metadata.keywords);
  const genre = genreScore(concept, game);
  const theme = jaccard(concept.taxonomy.themes, game.metadata.themes);
  const gameMode = jaccard(
    concept.taxonomy.gameModes,
    game.metadata.gameModes,
  );
  const price = priceComponent(concept.commercial.priceUsd, game.commercial.priceUsd.value);

  const components: ComponentEntry[] = [
    { name: 'semantic', weight: W_SEMANTIC, value: Math.max(0, Math.min(1, semanticScore)), available: true },
    { name: 'mechanics', weight: W_MECHANICS, value: mechanics, available: game.metadata.keywords.length > 0 },
    { name: 'genre', weight: W_GENRE, value: genre, available: true },
    { name: 'theme', weight: W_THEME, value: theme, available: game.metadata.themes.length > 0 },
    { name: 'gameMode', weight: W_GAME_MODE, value: gameMode, available: true },
    { name: 'price', weight: W_PRICE, value: price, available: true },
  ];

  const active = components.filter(c => c.available);
  const totalWeight = active.reduce((s, c) => s + c.weight, 0);
  const rawScore = totalWeight === 0
    ? 0
    : active.reduce((s, c) => s + (c.weight / totalWeight) * c.value, 0);

  const score = Math.round(rawScore * 100);

  const sorted = [...active].sort((a, b) => b.value * b.weight - a.value * a.weight);
  const top = sorted.slice(0, 2);
  const rationale = `${top.map(c => c.name).join(' and ')} are the strongest match factors.`;

  const drivers: Driver[] = active.map(c =>
    driver(c.name, Math.round((c.weight / totalWeight) * c.value * 100), `${c.name}: ${(c.value * 100).toFixed(0)}%`),
  );

  return {
    score,
    components: {
      semantic: components[0].value,
      mechanics: components[1].value,
      genre: components[2].value,
      theme: components[3].value,
      gameMode: components[4].value,
      price: components[5].value,
    },
    drivers,
    rationale,
  };
}
