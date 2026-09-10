# Backend API

Next.js App Router route handlers under `app/api/`. Node runtime (not edge — we read files and hold the corpus in process memory).

Stateless. Every request carries the state it needs. There are no session routes because there is no server session.

---

## Conventions

**Envelope.** Every response, success or failure:

```ts
type ApiResponse<T> =
  | { ok: true;  data: T; meta: ResponseMeta }
  | { ok: false; error: ApiError };

type ResponseMeta = {
  durationMs: number;
  corpusVersion: string;
  degraded?: DegradedFlag[];   // present when a fallback path was taken
};

type ApiError = {
  code: ErrorCode;
  message: string;             // safe to show the user
  details?: unknown;           // Zod issues in dev only
};

type ErrorCode =
  | 'INVALID_INPUT'
  | 'CORPUS_UNAVAILABLE'
  | 'AI_UNAVAILABLE'
  | 'INTERNAL';

type DegradedFlag =
  | 'llm_fallback'             // keyword extraction used
  | 'embedding_fallback'       // tag-only matching used
  | 'no_gamalytic';            // corpus built without commercial data
```

`degraded` flows straight to a UI banner. A degraded response is still `ok: true` — the user gets a result, with a note about its quality. This distinction matters: an outage should reduce precision, not produce an error page.

**Validation.** Zod schema per route in `app/api/**/schema.ts`, derived from `lib/types.ts`. Parse at the boundary; nothing downstream re-validates.

**Handlers are thin.** Validate, call one or two lib functions, wrap, return. If a handler exceeds ~30 lines, the logic belongs in `lib/`.

```ts
export async function POST(req: Request) {
  const t0 = performance.now();
  try {
    const body = DiscoverSchema.parse(await req.json());
    const data = await discoverCompetitors(body.concept);
    return ok(data, t0);
  } catch (e) {
    return fail(e, t0);
  }
}
```

`ok()` and `fail()` live in `lib/api/envelope.ts`. `fail()` maps `ZodError` → `INVALID_INPUT` 400, `CorpusError` → `CORPUS_UNAVAILABLE` 503, everything else → `INTERNAL` 500 with the detail stripped in production.

---

## Routes

### `POST /api/concept/analyze`

Free text → structured concept. Loops until confident enough.

```ts
// request
{
  text: string;                        // 1–8000 chars
  previous?: GameConcept;
  answers?: Record<string, string>;    // keyed by ConceptField
}

// response data
{
  concept: GameConcept;
  questions: ClarifyingQuestion[];     // empty = ready to proceed
  readyToProceed: boolean;
}
```

`readyToProceed` is true when every field in `REQUIRED_FOR_DISCOVERY` (`primaryGenre`, `mechanics` with ≥2 entries, `gameModes`) has confidence ≥ 0.5. The user can proceed anyway; this only controls whether the continue button is emphasized.

Degraded: `llm_fallback` when the keyword extractor was used.

Typical: 1.5 s cold, <5 ms cached.

---

### `POST /api/concept/import`

Document → concept. Section 0's first CTA.

```ts
// multipart/form-data: file (≤ 512 KB, .json|.md|.txt)

// response data
{
  concept: GameConcept;
  questions: ClarifyingQuestion[];
  importMethod: 'json_direct' | 'llm_extraction';
  truncated: boolean;                  // input exceeded 20k chars
}
```

`.json` is validated against the `GameConcept` schema and used directly — no LLM, no cost, instant. This is the round trip for our own JSON export.

Rejects other extensions with `INVALID_INPUT` and a message naming the accepted types.

---

### `POST /api/discover`

The core call. Concept → ranked competitors.

```ts
// request
{
  concept: GameConcept;
  limit?: number;                      // default 12, max 30
  excludeAppIds?: number[];            // user removed these
  includeAppIds?: number[];            // user added these manually
}

// response data
{
  competitors: ScoredCompetitor[];
  totalCandidates: number;             // survivors of the hard filter
  filterRelaxed: boolean;              // tag threshold dropped to 0
}
```

Pipeline: embed → hard filter → cosine over survivors → top 40 → rerank → top `limit`.

`includeAppIds` games are scored the same way and returned with `userAdded: true`. They bypass the filter and the limit, so a manually added game never gets silently dropped.

`totalCandidates` is surfaced in the UI — *"ranked from 312 candidates"* — which is a small credibility win and costs nothing.

Degraded: `embedding_fallback`.

Typical: 600 ms cold, 50 ms warm.

---

### `GET /api/games/search`

Autocomplete for manual competitor entry.

```
?q=phasmo&limit=8
```

```ts
// response data
{
  results: Array<{
    steamAppId: number;
    name: string;
    releaseDate: string | null;
    reviewCount: number | null;
    headerImage: string;               // Steam CDN, derived from appId
  }>;
}
```

Fuzzy match over corpus names — normalized, prefix-boosted, ranked by review count as a popularity tiebreak. Pure local. ~3 ms.

Only returns corpus members. A game not in the corpus cannot be analyzed, so offering it would be a dead end. If the query has no hits, the UI says the corpus doesn't cover it, which is honest and better than an empty dropdown.

---

### `GET /api/games/[appId]`

Full `NormalizedGame` for the detail drawer.

```ts
// response data
{ game: NormalizedGame }
```

Includes `history` and `reviewSentiment` when the game is one of the enriched ~500. Absent otherwise; the UI hides those panels rather than showing empty charts.

404 with `INVALID_INPUT` if not in the corpus.

---

### `POST /api/analyze`

Concept + competitors → the full market report.

```ts
// request
{
  concept: GameConcept;
  competitorAppIds: number[];          // 3–30
  horizonWeeks?: number;               // default 26
}

// response data
{ report: MarketReport }
```

Runs saturation, revenue, reception and release-risk over the given competitor set. Entirely synchronous after corpus load.

Deliberately separate from `/api/discover` so that adding or removing a competitor doesn't re-run the LLM or re-embed. The user curates in section 2, then analyzes once.

Fewer than 3 competitors returns `INVALID_INPUT` — a market report over two games would be arithmetic dressed as insight.

Typical: 30 ms.

---

### `POST /api/export/json`

```ts
// request
{ snapshot: Snapshot }

// response: application/json, Content-Disposition attachment
```

The client already holds the snapshot; this route exists to set the download headers and to stamp an export envelope:

```jsonc
{
  "exportVersion": "1",
  "exportedAt": "2026-09-10T14:22:00Z",
  "corpusVersion": "2026-09-10T04:12:00Z",
  "snapshot": { /* ... */ }
}
```

Re-importable through `/api/concept/import`, which closes the loop.

PDF export is client-side (`window.print()`), so there is no route for it. See [frontend-workflow.md](frontend-workflow.md#pdf-export).

---

### `GET /api/health`

```ts
{
  ok: true,
  corpus: { loaded: true, count: 4218, version: '...', upcomingCount: 1104 },
  ai: { extraction: 'available' | 'unavailable', embedding: 'available' | 'unavailable' },
  demoMode: boolean
}
```

Two minutes of work. Worth it: before the demo you hit one URL and know whether anything is degraded, instead of finding out on stage.

---

## Corpus loading

`lib/corpus/load.ts`. Loaded once per process, cached on `globalThis` so Next's dev hot-reload doesn't re-read 25 MB on every save.

```ts
declare global { var __corpus: Corpus | undefined; }

export function getCorpus(): Corpus {
  if (globalThis.__corpus) return globalThis.__corpus;

  const games = JSON.parse(readFileSync(join(CORPUS_PATH, 'games.json'), 'utf8'));
  const buf   = readFileSync(join(CORPUS_PATH, 'index.bin'));
  const vecs  = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);

  if (vecs.length !== games.meta.count * games.meta.dims) {
    throw new CorpusError('index.bin does not match games.json');
  }

  globalThis.__corpus = { games: games.games, meta: games.meta, vecs, /* upcoming... */ };
  return globalThis.__corpus;
}
```

The length check is the guard against the worst possible bug: a mismatched index silently returning the *wrong games* with plausible scores. It would look fine on stage and be completely wrong. Fail loudly at boot instead.

Vectors are one contiguous `Float32Array`, not an array of arrays. Row *i* is `vecs.subarray(i * dims, (i+1) * dims)`. No per-game allocation, and the cosine loop stays cache-friendly.

```ts
export function cosine(q: Float32Array, vecs: Float32Array, i: number, dims: number) {
  let s = 0;
  const o = i * dims;
  for (let d = 0; d < dims; d++) s += q[d] * vecs[o + d];
  return s;                      // both sides pre-normalized
}
```

Brute force over 4,200 rows: ~14 ms. See [decisions.md](decisions.md#adr-004) for why there is no ANN index.

---

## What deliberately doesn't exist

| Absent | Why |
| --- | --- |
| `POST /api/sessions` and friends | No server session. State is in the browser. |
| Auth | Nothing to protect. No user data on the server. |
| Rate limiting | No expensive downstream. The LLM cache is per-process and the corpus is local. |
| Pagination | Largest response is 30 competitors. |
| Webhooks, jobs, queues | Nothing runs longer than 600 ms. |
| A database | See [architecture.md](architecture.md#why-stateless). |

Each of these was in the original design and each was removed for a stated reason. That list, and the fact that it is written down, is a better answer to "is this architecture sound" than any amount of extra infrastructure would have been.
