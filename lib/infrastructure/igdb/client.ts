import 'server-only';
import { z } from 'zod';
import { withMcp } from '@/lib/infrastructure/mcp/client';
import { parseProvider } from '@/lib/infrastructure/collector/http';
import { providerIssue, type ProviderIssue } from '@/lib/infrastructure/collector/types';

const id = z.number().int().positive();
const relations = z.array(id).default([]);
const Game = z.object({ id, genres: relations, themes: relations, keywords: relations, player_perspectives: relations });
export type IgdbMetadata = { id: number; genres: string[]; themes: string[]; keywords: string[]; perspectives: string[] };
export type IgdbBatch = { games: Record<number, IgdbMetadata>; issues: Record<number, ProviderIssue> };

export async function fetchIgdb(appIds: number[]) {
  return withMcp(async call => {
    const games: IgdbBatch['games'] = {};
    const issues: IgdbBatch['issues'] = {};
    for (const appId of appIds) {
      try {
        const links = parseProvider('igdb', z.object({ results: z.array(z.object({ uid: z.string(), game: id, external_game_source: id })) }),
          await call('query', { entity: 'external_game', filters: { uid: { eq: String(appId) } }, limit: 100 }));
        const ids = [...new Set(links.results.filter(link => link.uid === String(appId) && link.external_game_source === 1).map(link => link.game))];
        if (ids.length !== 1) {
          issues[appId] = { provider: 'igdb', code: 'not_found', message: 'No unique Steam-to-IGDB match' };
          continue;
        }
        const result = parseProvider('igdb', z.object({ results: z.array(Game) }), await call('get_details', {
          entity: 'game', ids, fields: ['id', 'genres', 'themes', 'keywords', 'player_perspectives'],
        }));
        const game = result.results.find(game => game.id === ids[0]);
        if (!game) throw new Error('Missing matched game');
        const names = async (entity: string, ids: number[]) => {
          if (!ids.length) return [];
          const result = parseProvider('igdb', z.object({ results: z.array(z.object({ id, name: z.string() })) }),
            await call('get_details', { entity, ids: ids.slice(0, 100), fields: ['id', 'name'] }));
          return [...new Set(result.results.filter(row => ids.includes(row.id)).map(row => row.name))];
        };
        const [genres, themes, keywords, perspectives] = await Promise.all([
          names('genre', game.genres), names('theme', game.themes), names('keyword', game.keywords), names('player_perspective', game.player_perspectives),
        ]);
        games[appId] = { id: game.id, genres, themes, keywords, perspectives };
      } catch (error) {
        const issue = providerIssue('igdb', error);
        issues[appId] = issue;
        if (issue.code === 'rate_limited' || issue.code === 'unavailable') {
          for (const remaining of appIds.slice(appIds.indexOf(appId) + 1)) issues[remaining] = issue;
          break;
        }
      }
    }
    return { data: { games, issues }, fetchedAt: new Date().toISOString() };
  });
}
