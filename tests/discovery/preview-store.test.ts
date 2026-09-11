import { describe, expect, it } from 'vitest';
import { PreviewStore } from '@/lib/application/discovery/preview-store';
import type { DescriptionValidation } from '@/lib/domain/schemas';

const validation: DescriptionValidation = {
  status: 'ready', normalizedDescription: 'Multiplayer horror', confidence: 0.9,
  tags: [
    { name: 'Horror', category: 'theme', priority: 'required', basis: 'explicit' },
    { name: 'Multiplayer', category: 'mode', priority: 'required', basis: 'explicit' },
  ], mustHave: ['horror', 'multiplayer'], avoid: [], multiplayer: true, questions: [],
};
const input = { query: 'multiplayer horror', validation, candidates: [] };

describe('preview storage', () => {
  it('expires records after the configured TTL', () => {
    let now = 1_000;
    const store = new PreviewStore(100, 10, () => now);
    const record = store.create(input);
    now = 1_100;
    expect(() => store.get(record.id)).toThrow('expired');
  });

  it('bounds memory by evicting the oldest record', () => {
    const store = new PreviewStore(1000, 2, () => 1_000);
    const first = store.create(input);
    store.create(input);
    store.create(input);
    expect(() => store.get(first.id)).toThrow('not found');
  });

  it('prevents duplicate claims and supports release or completion', () => {
    const store = new PreviewStore();
    const record = store.create(input);
    expect(store.claim(record.id).state).toBe('collecting');
    expect(() => store.claim(record.id)).toThrow('already being collected');
    store.release(record.id);
    expect(store.claim(record.id).state).toBe('collecting');
    store.complete(record.id);
    expect(() => store.claim(record.id)).toThrow('already been used');
  });
});
