import 'server-only';
import { z } from 'zod';
import { ProviderError, type Provider } from './types';

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const SPACING: Record<Provider, number> = { steam: 1500, igdb: 250, gamalytic: 250 };
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_QUEUE_WAIT_MS = 65_000;

/** Reservations are synchronous, so concurrent callers cannot take the same slot. */
export class RequestGate {
  private nextAt = 0;
  private blockedUntil = 0;
  constructor(private spacing: number, private provider: Provider) {}
  async enter() {
    const now = Date.now();
    if (this.blockedUntil > now) throw new ProviderError(this.provider, 'rate_limited', `${this.provider} request quota is temporarily exhausted`);
    const start = Math.max(now, this.nextAt);
    if (start - now > MAX_QUEUE_WAIT_MS) throw new ProviderError(this.provider, 'rate_limited', `${this.provider} request queue is full; retry later`);
    this.nextAt = start + this.spacing;
    await sleep(Math.max(0, start - now));
    if (this.blockedUntil > Date.now()) throw new ProviderError(this.provider, 'rate_limited', `${this.provider} request quota is temporarily exhausted`);
  }
  block(ms: number) { this.blockedUntil = Math.max(this.blockedUntil, Date.now() + ms); }
}

declare global { var __collectorGates: Record<Provider, RequestGate> | undefined; }
const gates = globalThis.__collectorGates ??= {
  steam: new RequestGate(SPACING.steam, 'steam'),
  igdb: new RequestGate(SPACING.igdb, 'igdb'),
  gamalytic: new RequestGate(SPACING.gamalytic, 'gamalytic'),
};

export function providerGate(provider: Provider) { return gates[provider]; }

export function parseProvider<T extends z.ZodTypeAny>(provider: Provider, schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) throw new ProviderError(provider, 'invalid_data', `${provider} returned an unexpected data format`);
  return result.data;
}

export function parseJson(provider: Provider, text: string): unknown {
  try { return JSON.parse(text); }
  catch { throw new ProviderError(provider, 'invalid_data', `${provider} returned invalid JSON`); }
}

/** Never propagate provider bodies/URLs: OAuth responses can contain credentials. */
export async function requestText(provider: Provider, url: string, init: RequestInit = {}): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    await gates[provider].enter();
    try {
      const res = await fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      if (res.status === 429) {
        const retry = res.headers.get('retry-after');
        const seconds = retry && Number.isFinite(Number(retry)) ? Number(retry) : retry ? (Date.parse(retry) - Date.now()) / 1000 : 60;
        gates[provider].block(Math.max(60, Number.isFinite(seconds) ? seconds : 60) * 1000);
        await res.body?.cancel();
        throw new ProviderError(provider, 'rate_limited', `${provider} request quota is temporarily exhausted`);
      }
      if (res.status === 404) {
        await res.body?.cancel();
        throw new ProviderError(provider, 'not_found', `${provider} has no record for this game`);
      }
      if (!res.ok) {
        await res.body?.cancel();
        if (res.status >= 500 && attempt === 0) continue;
        throw new ProviderError(provider, 'unavailable', `${provider} request failed (HTTP ${res.status})`);
      }
      return await res.text();
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      if (attempt === 1) throw new ProviderError(provider, 'unavailable', `${provider} request failed or timed out`);
    }
  }
  throw new ProviderError(provider, 'unavailable', `${provider} data is unavailable`);
}
