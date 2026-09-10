import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/discovery/approve', () => ({ approvePreview: vi.fn() }));
import { approvePreview } from '@/lib/discovery/approve';
import { DiscoveryError } from '@/lib/discovery/types';
import { POST } from '@/app/api/games/discover/collect/route';

const id = '123e4567-e89b-42d3-a456-426614174000';
const request = (body: string) => new Request('http://localhost/api/games/discover/collect', { method: 'POST', body });
beforeEach(() => vi.resetAllMocks());

describe('approval collection API', () => {
  it('requires exactly one valid approval form', async () => {
    for (const body of ['{', JSON.stringify({ previewId: id }),
      JSON.stringify({ previewId: id, approveAll: true, selectedSteamAppIds: [1] })]) {
      expect((await POST(request(body))).status).toBe(400);
    }
    expect(approvePreview).not.toHaveBeenCalled();
  });

  it.each([
    ['PREVIEW_NOT_FOUND', 404], ['PREVIEW_EXPIRED', 410], ['PREVIEW_CONSUMED', 409],
    ['PREVIEW_BUSY', 409], ['INVALID_SELECTION', 400],
  ] as const)('maps %s to %i', async (code, status) => {
    vi.mocked(approvePreview).mockRejectedValue(new DiscoveryError(code, 'Safe error'));
    const response = await POST(request(JSON.stringify({ previewId: id, approveAll: true })));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('sanitizes unexpected collection failures', async () => {
    vi.mocked(approvePreview).mockRejectedValue(new Error('private provider response'));
    const response = await POST(request(JSON.stringify({ previewId: id, approveAll: true })));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private');
  });
});
