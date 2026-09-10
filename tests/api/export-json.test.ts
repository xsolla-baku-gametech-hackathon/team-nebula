import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/export/json/route';

const snapshot = {
  snapshotId: '11111111-1111-4111-8111-111111111111',
  generatedAt: '2026-09-10T00:00:00.000Z',
  conceptVersion: 1,
  concept: { title: 'Test' },
  competitors: [],
  report: { verdict: { decision: 'KEEP' } },
  corpusVersion: 'live',
};

function request(body: unknown): Request {
  return new Request('http://localhost/api/export/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('JSON snapshot export', () => {
  it('returns a downloadable, importable snapshot wrapper', async () => {
    const response = await POST(request({ snapshot }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('content-disposition')).toContain(snapshot.snapshotId);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toMatchObject({ exportVersion: '1', corpusVersion: 'live', snapshot });
  });

  it('rejects incomplete or unsafe snapshot identifiers', async () => {
    const incomplete = await POST(request({ snapshot: { snapshotId: 'missing-fields' } }));
    const unsafe = await POST(request({ snapshot: { ...snapshot, snapshotId: 'bad\"\r\nheader' } }));

    expect(incomplete.status).toBe(400);
    expect(unsafe.status).toBe(400);
  });
});
