import 'server-only';
import { z } from 'zod';
import { withMcp } from '@/lib/collector/mcp-client';
import { parseProvider } from '@/lib/collector/http';

const Links = z.object({ results: z.array(z.object({
  game: z.number().int().positive(), external_game_source: z.number().int(), uid: z.string(),
})) });
export function steamIdentity(input: unknown, igdbId: number): number | null {
  const result = parseProvider('igdb', Links, input);
  const ids = [...new Set(result.results.filter(link => link.game === igdbId && link.external_game_source === 1 && /^\d+$/.test(link.uid))
    .map(link => Number(link.uid)).filter(id => Number.isSafeInteger(id) && id > 0 && id <= 2 ** 32 - 1))];
  return ids.length === 1 ? ids[0] : null;
}
export async function resolveSteamIds(igdbIds: number[]) {
  return withMcp(async call => {
    const mapped: Record<number, number> = {};
    for (const igdbId of igdbIds) {
      const result = await call('query', { entity: 'external_game', filters: { game: { eq: igdbId } }, limit: 100 });
      const appId = steamIdentity(result, igdbId);
      if (appId !== null) mapped[igdbId] = appId;
    }
    return mapped;
  });
}
