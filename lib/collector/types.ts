import { z } from 'zod';
import type { NormalizedGame, Source, Sourced } from '@/lib/types';

export const CollectInput = z.object({
  steamAppIds: z.array(z.number().int().positive().max(2 ** 32 - 1))
    .min(1).max(10).transform(ids => [...new Set(ids)]),
}).strict();

export type Provider = 'steam' | 'igdb' | 'gamalytic';
export type IssueCode = 'unavailable' | 'not_found' | 'invalid_data' | 'rate_limited' | 'not_configured' | 'missing_field';
export type ProviderIssue = { provider: Provider; code: IssueCode; message: string; field?: string };
export type ReviewComment = {
  id: string;
  text: string;
  language: 'english';
  recommended: boolean;
  createdAt: string;
  helpfulVotes: number;
};
export type CollectedGame = NormalizedGame & {
  commercial: NormalizedGame['commercial'] & { regularPriceUsd: Sourced<number>; currency: 'USD' };
  release: NormalizedGame['release'] & { dateText: string | null; datePrecision: 'exact' | 'month' | 'quarter' | 'unknown' };
  reviews: NormalizedGame['reviews'] & { comments: ReviewComment[] };
  collection: {
    collectedAt: string;
    sources: Record<string, Source>;
    fetches: Record<string, { fetchedAt: string }>;
    issues: ProviderIssue[];
  };
};
export type CollectionFailure = { steamAppId: number; code: IssueCode; message: string };
export type CollectionResult = { games: CollectedGame[]; failures: CollectionFailure[] };
export type Fetched<T> = { data: T; fetchedAt: string };

export class ProviderError extends Error {
  constructor(public readonly provider: Provider, public readonly code: IssueCode, message: string) {
    super(message);
    this.name = 'ProviderError';
  }
}

export function providerIssue(provider: Provider, error: unknown): ProviderIssue {
  return error instanceof ProviderError
    ? { provider, code: error.code, message: error.message }
    : { provider, code: 'unavailable', message: `${provider} data is temporarily unavailable` };
}
