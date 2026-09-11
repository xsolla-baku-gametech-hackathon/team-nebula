import 'server-only';
import { z } from 'zod';
import { withMcp } from '@/lib/collector/mcp-client';
import { parseProvider } from '@/lib/collector/http';
import { plainText } from '@/lib/collector/steam-details';
import { buildSearchQueries } from '@/lib/application/discovery/search-queries';
import type { Candidate, DescriptionValidation } from '@/lib/domain/schemas';

const SearchResult = z.object({ results: z.array(z.object({
  game: z.object({ id: z.number().int().positive(), name: z.string().min(1), summary: z.string().nullish(), game_modes: z.array(z.number().int()).nullish() }),
  content: z.string().optional(),
  similarity: z.number().min(0).max(1),
})) });
export function parseCandidates(input: unknown, intent: { multiplayer: boolean | null }): Candidate[] {
  const result = parseProvider('igdb', SearchResult, input);
  const unique = new Map<number, Candidate>();
  for (const { game, content, similarity } of result.results) {
    const gameModes = game.game_modes ?? [];
    const multiplayer = gameModes.some(mode => [2, 3, 4, 5, 6].includes(mode));
    if (intent.multiplayer === true && !multiplayer) continue;
    if (intent.multiplayer === false && (!gameModes.includes(1) || multiplayer)) continue;
    const description = plainText(game.summary ?? '', 2500);
    if (!description) continue;
    unique.set(game.id, {
      igdbId: game.id,
      name: game.name,
      description,
      context: plainText(content ?? '', 3000),
      gameModes,
      semanticScore: similarity,
    });
  }
  return [...unique.values()];
}

export async function findPreviewCandidates(validation: DescriptionValidation): Promise<Candidate[]> {
  return withMcp(async call => {
    const unique = new Map<number, Candidate>();
    for (const query of buildSearchQueries(validation)) {
      const result = await call('semantic_search_games', { query, limit: 40, fields: ['id', 'name', 'summary', 'game_modes'] });
      for (const candidate of parseCandidates(result, validation)) {
        const existing = unique.get(candidate.igdbId);
        if (!existing || candidate.semanticScore > existing.semanticScore) {
          unique.set(candidate.igdbId, candidate);
        }
      }
    }
    return [...unique.values()].slice(0, 60);
  });
}
