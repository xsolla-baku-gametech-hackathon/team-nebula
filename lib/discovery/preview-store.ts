import 'server-only';
import { randomUUID } from 'node:crypto';
import { DiscoveryError, type DescriptionValidation, type PreviewCandidate } from './types';

export type PreviewRecord = {
  id: string;
  query: string;
  validation: DescriptionValidation;
  candidates: PreviewCandidate[];
  createdAt: number;
  expiresAt: number;
  state: 'ready' | 'collecting' | 'consumed';
};

export class PreviewStore {
  private records = new Map<string, PreviewRecord>();
  constructor(private ttlMs = 30 * 60_000, private maxRecords = 100, private now = () => Date.now()) {}

  create(input: Pick<PreviewRecord, 'query' | 'validation' | 'candidates'>): PreviewRecord {
    this.prune();
    while (this.records.size >= this.maxRecords) this.records.delete(this.records.keys().next().value!);
    const createdAt = this.now();
    const record: PreviewRecord = { ...input, id: randomUUID(), createdAt, expiresAt: createdAt + this.ttlMs, state: 'ready' };
    this.records.set(record.id, record);
    return record;
  }

  get(id: string): PreviewRecord {
    const record = this.records.get(id);
    if (!record) throw new DiscoveryError('PREVIEW_NOT_FOUND', 'Discovery preview was not found');
    if (record.expiresAt <= this.now()) {
      this.records.delete(id);
      throw new DiscoveryError('PREVIEW_EXPIRED', 'Discovery preview has expired');
    }
    return record;
  }

  claim(id: string): PreviewRecord {
    const record = this.get(id);
    if (record.state === 'collecting') throw new DiscoveryError('PREVIEW_BUSY', 'Discovery preview is already being collected');
    if (record.state === 'consumed') throw new DiscoveryError('PREVIEW_CONSUMED', 'Discovery preview has already been used');
    record.state = 'collecting';
    return record;
  }

  complete(id: string) {
    const record = this.records.get(id);
    if (record?.state === 'collecting') record.state = 'consumed';
  }

  release(id: string) {
    const record = this.records.get(id);
    if (record?.state === 'collecting') record.state = 'ready';
  }

  private prune() {
    const now = this.now();
    for (const [id, record] of this.records) if (record.expiresAt <= now) this.records.delete(id);
  }
}

declare global { var __discoveryPreviewStore: PreviewStore | undefined; }
export const previewStore = globalThis.__discoveryPreviewStore ??= new PreviewStore();
