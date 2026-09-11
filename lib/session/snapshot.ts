import type { GameConcept, MarketReport, ScoredCompetitor, Snapshot } from '@/lib/domain/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function createSnapshot(input: {
  concept: GameConcept;
  competitors: ScoredCompetitor[];
  report: MarketReport;
  corpusVersion: string;
}): Snapshot {
  const snapshot: Snapshot = structuredClone({
    snapshotId: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    conceptVersion: input.concept.version,
    concept: input.concept,
    competitors: input.competitors,
    report: input.report,
    corpusVersion: input.corpusVersion,
  });
  return deepFreeze(snapshot);
}

export function snapshotFromImport(input: unknown): Snapshot | null {
  if (!isRecord(input)) return null;
  const candidate = isRecord(input.snapshot) ? input.snapshot : input;
  if (
    typeof candidate.snapshotId !== 'string'
    || typeof candidate.generatedAt !== 'string'
    || typeof candidate.conceptVersion !== 'number'
    || typeof candidate.corpusVersion !== 'string'
    || !isRecord(candidate.concept)
    || !Array.isArray(candidate.competitors)
    || !isRecord(candidate.report)
  ) return null;
  return candidate as Snapshot;
}
