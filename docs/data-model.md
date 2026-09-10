# Data model

`lib/types.ts` is committed **first** and frozen. Every lane codes against it from hour one, using fixtures, so nobody blocks on the corpus being ready.

Changing a type in this file after the freeze requires telling everyone. Adding an optional field does not.

---

## Provenance primitives

Every value that came from outside our own arithmetic is wrapped. This is the mechanism behind the provenance labels in the UI.

```ts
export type Source =
  | 'steam'        // factual, from Steam's own endpoints
  | 'igdb'         // structured metadata
  | 'gamalytic'    // third-party commercial estimate
  | 'releasesignal'// our own model
  | 'user';        // the user typed it

export type Sourced<T> = {
  value: T | null;
  source: Source;
  /** true if the number is modelled rather than observed */
  estimated: boolean;
  /** only set when source === 'releasesignal' */
  method?: string;
};
```

Usage rule: if it is a fact you could verify on a Steam page, `estimated: false`. If a model produced it, `estimated: true` and `method` explains how in one short string, e.g. `'boxleiter, multiplier=32, ×price'`.

The UI renders the `ⓘ` label directly from `source`, so mislabelling is a visible bug, not a silent one.

---

## GameConcept

The user's game, normalized. Produced by the LLM extractor, edited by the user, and the input to everything downstream.

```ts
export type GameConcept = {
  version: number;              // bumps on every edit; invalidates snapshots

  concept: {
    title: string | null;
    shortDescription: string;   // 1–3 sentences, LLM-written, this is what we embed
    rawText: string;            // exactly what the user typed, never modified
    platforms: Platform[];
    targetSteam: boolean;
  };

  taxonomy: {
    primaryGenre: string | null;
    secondaryGenres: string[];
    themes: string[];
    mechanics: string[];        // the highest-signal field for matching
    gameModes: GameMode[];
    perspective: Perspective | null;
  };

  commercial: {
    priceUsd: number | null;
    plannedRelease: string | null;   // ISO date or 'YYYY-MM'
    teamSize: number | null;
    isFirstTitle: boolean | null;
  };

  confidence: Partial<Record<ConceptField, number>>;  // 0–1 per field
  missingImportantFields: ConceptField[];
};

export type Platform = 'PC' | 'Mac' | 'Linux' | 'Switch' | 'PS5' | 'Xbox';
export type GameMode =
  | 'Singleplayer' | 'Online Co-op' | 'Local Co-op'
  | 'Online PvP' | 'Local PvP' | 'MMO';
export type Perspective =
  | 'First person' | 'Third person' | 'Isometric'
  | 'Side view' | 'Top down' | 'Text';
export type ConceptField =
  | 'primaryGenre' | 'mechanics' | 'gameModes' | 'perspective'
  | 'priceUsd' | 'plannedRelease' | 'platforms';
```

Notes that matter:

- `rawText` is never rewritten. Diffing works against it. If the LLM's summary drifts, the user's words are still the ground truth.
- `shortDescription` is what gets embedded, not `rawText`. The LLM normalizes phrasing so that "spooky 4-player ghost hunting" and "cooperative supernatural investigation for four" land near each other in vector space.
- `confidence` is per-field and drives which clarifying questions get asked. Fields below `0.5` are candidates.
- `version` is the snapshot-invalidation key. Nothing else needs to track staleness.

---

## NormalizedGame

One entry in the corpus. Every competitor the user sees is this shape. No provider response ever reaches the frontend.

```ts
export type NormalizedGame = {
  identity: {
    steamAppId: number;         // canonical, always present
    igdbId: number | null;
    name: string;
    steamUrl: string;           // derived from appId, never stored upstream
  };

  metadata: {
    summary: string;
    genres: string[];
    themes: string[];
    tags: string[];             // Steam user tags — the pre-filter key
    keywords: string[];
    gameModes: GameMode[];
    perspectives: Perspective[];
    platforms: Platform[];
    developers: string[];
    publishers: string[];
  };

  release: {
    date: string | null;        // ISO
    isReleased: boolean;
    isEarlyAccess: boolean;
  };

  commercial: {
    priceUsd: Sourced<number>;
    estimatedCopiesSold: Sourced<number>;
    estimatedRevenueUsd: Sourced<number>;
  };

  reviews: {
    total: Sourced<number>;
    positive: Sourced<number>;
    negative: Sourced<number>;
    positiveRatio: Sourced<number>;
    sentimentSummary: Sourced<string>;   // 'Very Positive' etc.
  };

  /** present only for the ~500 enriched titles */
  history?: {
    peakCcu: TimePoint[];
    revenue: TimePoint[];
  };
};

export type TimePoint = { t: string; v: number };
```

The embedding for a game is **not** on this object. Vectors live in `index.bin`, addressed by the same row order as `games.json`. Keeping 1536 floats out of the JSON keeps the file readable and the payloads small.

---

## ScoredCompetitor

A `NormalizedGame` plus our judgement of it. This is what the discover endpoint returns.

```ts
export type ScoredCompetitor = {
  game: NormalizedGame;

  similarity: {
    score: number;              // 0–100, final
    components: {
      semantic: number;
      mechanics: number;
      genre: number;
      theme: number;
      gameMode: number;
      price: number;
    };
    /** one human sentence explaining the score */
    rationale: string;
  };

  competitiveThreat: number;    // 0–100
  /** true if the user added this manually rather than us discovering it */
  userAdded: boolean;
};
```

`components` is exposed to the UI on purpose. Hovering a similarity score shows the breakdown. A judge asking "why is that game ranked first" gets an answer on screen rather than a shrug.

---

## MarketReport

Output of the scoring layer. Everything the analysis dashboard renders.

```ts
export type MarketReport = {
  saturation: {
    score: number;              // 0–100, higher = worse
    band: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    drivers: Driver[];          // why, in order of contribution
  };

  revenue: {
    conservative: number;
    base: number;
    upside: number;
    currency: 'USD';
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    basedOnCount: number;       // how many comparables fed the estimate
    method: string;
  };

  reception: {
    predictedPositiveRatio: number | null; // null when no valid review evidence exists
    cohortMedian: number | null;
    band: 'LOW' | 'MEDIUM' | 'HIGH';
  };

  releaseWindows: ReleaseWindow[];

  verdict: {
    decision: 'KEEP' | 'MOVE' | 'MITIGATE' | 'INSUFFICIENT_DATA';
    currentDate: string | null;
    recommendedDate: string | null;
    reasoning: string[];        // 2–4 short lines
  };
};

export type ReleaseWindow = {
  weekStart: string;            // ISO Monday
  weekEnd: string;
  risk: number;                 // 0–100
  band: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  competingReleases: UpcomingRelease[];
  drivers: Driver[];
};

export type UpcomingRelease = {
  igdbId: number;
  steamAppId: number | null;
  name: string;
  expectedDate: string | null;
  dateLabel: string;
  dateConfidence: 'exact' | 'month' | 'quarter' | 'vague';
  rangeStart: string | null;
  rangeEnd: string | null;
  similarity: number;           // 0–100 against the user's concept
  threat: number;               // 0–100
  followers: number | null;
  hypes: number | null;
  isMajorPublisher: boolean;
};

export type Driver = {
  label: string;                // 'Comparable releases in window'
  contribution: number;         // signed, in score points
  detail: string;               // '9 games scoring >70 similarity'
};
```

`Driver[]` is required, not optional, on every score. A score without drivers cannot be explained, and an unexplainable score is the thing that gets a product dismissed as a black box. The scoring functions build drivers as they compute; it is not a separate pass.

---

## Snapshot

See [architecture.md](architecture.md#the-snapshot). Deep-frozen client-side object; the sole source of truth for the dashboard, the calendar and both exporters.

```ts
export type Snapshot = {
  snapshotId: string;
  generatedAt: string;
  conceptVersion: number;
  concept: GameConcept;
  competitors: ScoredCompetitor[];
  report: MarketReport;
  corpusVersion: string;
};
```

---

## Corpus file formats

**`data/games.json`**

```jsonc
{
  "meta": {
    "corpusVersion": "2026-09-10T04:12:00Z",
    "count": 4218,
    "embeddingModel": "text-embedding-3-small",
    "dims": 1536,
    "enrichedCount": 512
  },
  "games": [ /* NormalizedGame[] — row order matches index.bin */ ]
}
```

**`data/index.bin`** — a raw `Float32Array`, `count × dims`, little-endian, row-major, L2-normalized at build time so cosine is a plain dot product. Row *i* corresponds to `games[i]`.

**`data/upcoming.json`** — unreleased titles with expected dates. Same shape as `NormalizedGame` but `release.isReleased === false` and `release.date` may be a coarse string. Has its own embeddings in `data/upcoming.bin`.

Normalizing vectors offline is worth mentioning: it turns the hot loop into a dot product with no per-query square roots, and it removes an entire class of "why is everything 0.99" bugs.

---

## Fixtures

`lib/fixtures/` contains hand-written instances of every type above:

- `concept.horror-coop.ts` — the demo concept
- `competitors.horror-coop.ts` — 12 `ScoredCompetitor`s
- `report.horror-coop.ts` — a full `MarketReport`
- `snapshot.demo.ts` — the assembled snapshot

The frontend lanes build entirely against these until the corpus lands. They are also the input to most unit tests. They must stay valid — CI type-checks them.
