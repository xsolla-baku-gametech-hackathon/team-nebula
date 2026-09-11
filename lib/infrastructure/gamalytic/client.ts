import 'server-only';
import { z } from 'zod';
import { parseJson, parseProvider, requestText } from '@/lib/infrastructure/collector/http';
import { ProviderError } from '@/lib/infrastructure/collector/types';

const appId = z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
  .pipe(z.number().int().positive().max(2 ** 32 - 1));
const estimate = z.number().nonnegative().finite().nullable().optional();
export const GamalyticGameSchema = z.object({
  steamId: appId,
  copiesSold: z.number().int().nonnegative().finite().nullable().optional(),
  revenue: estimate,
});
export type GamalyticGame = z.infer<typeof GamalyticGameSchema>;
export type GamalyticBatch = { games: Record<number, GamalyticGame>; invalidIds: number[] };

export function parseGamalytic(input: unknown, requested: number[]): GamalyticBatch {
  const envelope = parseProvider('gamalytic', z.object({ result:z.array(z.unknown()) }), input);
  const games: Record<number, GamalyticGame> = {};
  const invalidIds = new Set<number>();
  for (const raw of envelope.result) {
    const identity = z.object({steamId:appId}).safeParse(raw);
    if (!identity.success || !requested.includes(identity.data.steamId)) continue;
    const id = identity.data.steamId;
    const parsed = GamalyticGameSchema.safeParse(raw);
    if (!parsed.success || id in games || invalidIds.has(id)) {
      invalidIds.add(id);
      delete games[id];
    } else games[id] = parsed.data;
  }
  return {games,invalidIds:[...invalidIds]};
}

export async function fetchGamalytic(appIds: number[]) {
  const ids = [...new Set(appIds)];
  if (ids.length < 1 || ids.length > 10) throw new ProviderError('gamalytic','invalid_data','Expected one to ten selected games');
  const params = new URLSearchParams({
    appids:ids.join(','), limit:String(ids.length), release_status:'all',
    fields:'steamId,copiesSold,revenue',
  });
  const input = parseJson('gamalytic', await requestText('gamalytic', `https://api.gamalytic.com/steam-games/list?${params}`));
  return {data:parseGamalytic(input, ids),fetchedAt:new Date().toISOString()};
}
