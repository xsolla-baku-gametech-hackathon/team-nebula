import 'server-only';
import type { Fetched } from './types';

export const STEAM_TTL = 60 * 60 * 1000;
export const ENRICHMENT_TTL = 24 * STEAM_TTL;

/** Per-process, bounded LRU. Failed loads are never cached; in-flight loads are shared. */
export class DataCache<T> {
  private values = new Map<string, { data: T; fetchedAt: string; expiresAt: number }>();
  private pending = new Map<string, Promise<{ data: T; fetchedAt: string; expiresAt: number }>>();
  constructor(private ttl: number, private capacity = 512) {}
  async get(key: string, loader: () => Promise<T>): Promise<Fetched<T>> {
    const existing = this.values.get(key);
    if (existing && existing.expiresAt > Date.now()) {
      this.values.delete(key);
      this.values.set(key, existing);
      return { data: structuredClone(existing.data), fetchedAt: existing.fetchedAt, cached: true };
    }
    this.values.delete(key);
    const inflight = this.pending.get(key);
    if (inflight) {
      const value = await inflight;
      return { data: structuredClone(value.data), fetchedAt: value.fetchedAt, cached: true };
    }
    if (this.pending.size >= this.capacity) throw new Error('Collector cache is busy');
    const promise = loader().then(data => {
      const value = { data: structuredClone(data), fetchedAt: new Date().toISOString(), expiresAt: Date.now() + this.ttl };
      this.values.set(key, value);
      while (this.values.size > this.capacity) this.values.delete(this.values.keys().next().value!);
      return value;
    });
    this.pending.set(key, promise);
    try {
      const value = await promise;
      return { data: structuredClone(value.data), fetchedAt: value.fetchedAt, cached: false };
    } finally { this.pending.delete(key); }
  }
}
