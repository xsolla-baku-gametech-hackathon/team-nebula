import { describe, expect, it, vi } from 'vitest';
import { approvePreview, type ApprovalProviders } from '@/lib/application/discovery/approve-competitors';
import { PreviewStore } from '@/lib/application/discovery/preview-store';
import { normalizeGame } from '@/lib/infrastructure/collector/normalize-game';
import { SteamDetailsSchema } from '@/lib/infrastructure/steam/details';
import type { DescriptionValidation, PreviewCandidate } from '@/lib/domain/schemas';
import type { CollectionResult } from '@/lib/infrastructure/collector/types';

const validation: DescriptionValidation = { status: 'ready', normalizedDescription: 'Co-op horror', confidence: 0.9,
  tags: [
    { name: 'Horror', category: 'theme', priority: 'required', basis: 'explicit' },
    { name: 'Co-op', category: 'mode', priority: 'required', basis: 'explicit' },
  ], mustHave: ['horror'], avoid: [], multiplayer: true, questions: [] };
const candidates: PreviewCandidate[] = [
  { steamAppId: 100, igdbId: 1, name: 'First', semanticScore: 0.81, reason: 'First reason', matchedTags: ['Horror'] },
  { steamAppId: 200, igdbId: 2, name: 'Second', semanticScore: 0.92, reason: 'Second reason', matchedTags: ['Horror', 'Co-op'] },
];
const game = (steamAppId: number, igdbId: number) => ({ ...normalizeGame(SteamDetailsSchema.parse({ steam_appid: steamAppId,
  type: 'game', name: `Game ${steamAppId}`, release_date: { coming_soon: false, date: '' } }), { issues: [], fetches: {} }),
  identity: { steamAppId, igdbId, name: `Game ${steamAppId}`, steamUrl: `https://store.steampowered.com/app/${steamAppId}/` } });
function setup() {
  const store = new PreviewStore();
  const record = store.create({ query: 'co-op horror', validation, candidates });
  const collect = vi.fn(async (input: unknown): Promise<CollectionResult> =>
    ({ games: (input as { steamAppIds: number[] }).steamAppIds.map(id => game(id, id === 100 ? 1 : 2)), failures: [] }));
  return { record, deps: { store, collect } satisfies ApprovalProviders };
}

describe('preview approval', () => {
  it('collects an approved subset in preview ranking order', async () => {
    const { record, deps } = setup();
    const result = await approvePreview({ previewId: record.id, selectedSteamAppIds: [200] }, deps);
    expect(deps.collect).toHaveBeenCalledWith({ steamAppIds: [200] });
    expect(result.games[0].match).toEqual({ source: 'xai', reason: 'Second reason', matchedTags: ['Horror', 'Co-op'], candidateIgdbId: 2, semanticScore: 0.92 });
  });

  it('supports approving every previewed candidate', async () => {
    const { record, deps } = setup();
    const result = await approvePreview({ previewId: record.id, approveAll: true }, deps);
    expect(result.games.map(item => item.identity.steamAppId)).toEqual([100, 200]);
    expect(result.approval.complete).toBe(true);
  });

  it('rejects unapproved or duplicate selections and releases the preview', async () => {
    const { record, deps } = setup();
    await expect(approvePreview({ previewId: record.id, selectedSteamAppIds: [999] }, deps)).rejects.toMatchObject({ code: 'INVALID_SELECTION' });
    expect(deps.store.get(record.id).state).toBe('ready');
    await expect(approvePreview({ previewId: record.id, selectedSteamAppIds: [100, 100] }, deps)).rejects.toMatchObject({ code: 'INVALID_SELECTION' });
    expect(deps.collect).not.toHaveBeenCalled();
  });

  it('releases provider failures and consumes normal results', async () => {
    const { record, deps } = setup();
    deps.collect.mockRejectedValueOnce(new Error('provider failed'));
    await expect(approvePreview({ previewId: record.id, approveAll: true }, deps)).rejects.toThrow('provider failed');
    expect(deps.store.get(record.id).state).toBe('ready');
    await approvePreview({ previewId: record.id, approveAll: true }, deps);
    expect(() => deps.store.claim(record.id)).toThrow('already been used');
  });

  it('does not replace an approved game that collection cannot load', async () => {
    const { record, deps } = setup();
    deps.collect.mockResolvedValueOnce({ games: [game(100, 1)], failures: [{ steamAppId: 200, code: 'not_found', message: 'Unavailable' }] });
    const result = await approvePreview({ previewId: record.id, approveAll: true }, deps);
    expect(result.games.map(item => item.identity.steamAppId)).toEqual([100]);
    expect(result.failures[0].steamAppId).toBe(200);
    expect(deps.collect).toHaveBeenCalledTimes(1);
  });
});
