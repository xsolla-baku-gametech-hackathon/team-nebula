import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import corpus from '@/data/games.json';
import { conceptHorrorCoop } from '@/tests/fixtures/concept.horror-coop';

vi.mock('@/lib/infrastructure/corpus/load', () => ({ getCorpus: vi.fn() }));
vi.mock('@/lib/infrastructure/embeddings/client', () => ({ embedConcept: vi.fn() }));

import { getCorpus } from '@/lib/infrastructure/corpus/load';
import { embedConcept } from '@/lib/infrastructure/embeddings/client';
import { POST } from '@/app/api/discover/route';
import type { Corpus } from '@/lib/infrastructure/corpus/load';

function request() {
  return new NextRequest('http://localhost/api/discover', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept: conceptHorrorCoop, limit: 1 }),
  });
}

describe('corpus discovery semantic provenance', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getCorpus).mockReturnValue({
      games: [corpus.games[0]],
      meta: { ...corpus.meta, count: 1, dims: 2, embeddingModel: 'text-embedding-3-small' },
      vecs: new Float32Array([1, 0]), upcoming: [],
    } as Corpus);
  });

  it('combines actual embedding evidence with structured features', async () => {
    vi.mocked(embedConcept).mockResolvedValue(new Float32Array([1, 0]));
    const response = await POST(request());
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.competitors[0].similarity.components.semantic).toBe(1);
    expect(body.meta.degraded).toBeUndefined();
    expect(embedConcept).toHaveBeenCalledWith(conceptHorrorCoop);
  });

  it('marks provider failure as structured-only fallback', async () => {
    vi.mocked(embedConcept).mockRejectedValue(new Error('provider unavailable'));
    const response = await POST(request());
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.competitors[0].similarity.components.semantic).toBeNull();
    expect(body.meta.degraded).toEqual(['embedding_fallback']);
  });

  it('never compares the demo tag-only index against text embeddings', async () => {
    const demo = getCorpus();
    vi.mocked(getCorpus).mockReturnValue({ ...demo, meta: { ...demo.meta, embeddingModel: 'none-tag-only' } });
    const body = await (await POST(request())).json();
    expect(embedConcept).not.toHaveBeenCalled();
    expect(body.data.competitors[0].similarity.components.semantic).toBeNull();
    expect(body.meta.degraded).toEqual(['embedding_fallback']);
  });
});
