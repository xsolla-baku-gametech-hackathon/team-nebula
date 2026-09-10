# Testing

Vitest. `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`.

The strategy is narrow on purpose: **test the pure functions thoroughly, test the boundaries lightly, test the UI not at all.**

That is not a shortcut, it is where the risk actually is. The scoring layer is where a wrong answer is both plausible-looking and invisible — a similarity function with a transposed weight produces a ranked list that looks entirely reasonable and is entirely wrong. UI bugs announce themselves the moment you look at the screen.

---

## What is tested

### `lib/scoring/` — thorough

Every function, every branch. These are pure, synchronous and take plain data, so there is no setup, no mocking and no excuse.

```
similarity.test.ts
  ✓ identical concept and game scores near 100
  ✓ unrelated game scores below 30
  ✓ weights sum to 1.0
  ✓ missing theme component reweights remaining to sum 1.0
  ✓ all components missing except semantic → semantic weight becomes 1.0
  ✓ empty candidate list returns empty, does not throw
  ✓ price component is symmetric around the delta
  ✓ price delta > $20 floors the component at 0
  ✓ component values are all within [0,1]
  ✓ rationale names the two highest components

saturation.test.ts
  ✓ zero comparables → score 0, does not divide by zero
  ✓ zero upcoming releases → upcomingPressure 0, not NaN
  ✓ all comparables successful → successRate factor near 0
  ✓ single comparable holding all revenue → concentration 1.0
  ✓ band boundaries at 30 / 55 / 80
  ✓ drivers sum to score

revenue.test.ts
  ✓ 3 comparables → LOW confidence, still returns a range
  ✓ 12 tight comparables → HIGH confidence
  ✓ conservative <= base <= upside, always
  ✓ all comparables have null revenue → returns nulls, not zeros
  ✓ price elasticity: doubling price raises base by less than 2×
  ✓ squared weighting: one sim-95 outweighs five sim-60
  ✓ first-title modifier reduces all three figures
  ✓ output rounded to 2 significant figures
  ✓ modifiers compose multiplicatively, order-independent

release-risk.test.ts
  ✓ empty upcoming set → uniform low risk across horizon
  ✓ exact-dated game concentrates weight on its week
  ✓ month-confidence game spreads across 4 weeks, total weight preserved
  ✓ quarter-confidence spreads across 13 weeks, total weight preserved
  ✓ vague-dated game contributes zero
  ✓ quarter spanning a year boundary lands in the right weeks
  ✓ plannedRelease null → KEEP with a recommendation
  ✓ delta < 15 → KEEP
  ✓ delta >= 15 and best within 8 weeks → MOVE
  ✓ delta >= 15 and best beyond 8 weeks → MITIGATE
  ✓ best week never falls inside the next 3 weeks
  ✓ horizon length is respected exactly
  ✓ drivers sum to score, for every week

boxleiter.test.ts
  ✓ multiplier selected by correct price band
  ✓ band boundaries are inclusive as documented
  ✓ zero reviews → null, not zero revenue
```

The three that catch the most real bugs: weight sums, driver sums, and the date-spreading weight-preservation tests. Every one of those has failed at least once during development on a change that looked harmless.

### Cross-cutting invariants

```
drivers.test.ts
  ✓ every engine: Σ driver.contribution ≈ score (±0.1)

embed-symmetry.test.ts
  ✓ corpus-side and concept-side embed builders produce the same
    field order, labels and separators for a shared fixture
```

`embed-symmetry` is the highest-value test in the repo relative to its size. Silent divergence between the two builders degrades every result in a way that looks like "the model isn't very good" rather than "we have a bug."

### `lib/corpus/` — moderate

Against a 50-game fixture corpus (`tests/fixtures/mini-corpus/`), committed, ~200 KB.

```
  ✓ load rejects an index.bin with mismatched length
  ✓ load rejects a vector containing NaN
  ✓ cosine matches a naive reference implementation
  ✓ tag filter respects the threshold
  ✓ filter relaxes to 0 when survivors < 60
  ✓ fuzzy search: exact prefix ranks first
  ✓ fuzzy search: review count breaks ties
  ✓ upcomingBetween respects an inclusive start, exclusive end
```

The mismatched-index test guards the worst failure mode in the system: the wrong games returned with plausible scores. Loud at boot beats wrong on stage.

### `app/api/` — light

One test per route, exercising the envelope rather than the logic.

```
  ✓ valid input → { ok: true }, meta.corpusVersion present
  ✓ malformed body → 400 INVALID_INPUT
  ✓ /api/analyze with 2 competitors → 400
  ✓ /api/games/[appId] unknown id → 404
  ✓ AI failure → ok:true with degraded: ['llm_fallback']
```

That last one matters most. It asserts the design promise that degradation is not an error.

### `lib/ai/` — fallbacks only

The LLM path is not unit-tested; asserting on model output is testing the vendor.

```
fallback-extract.test.ts
  ✓ extracts genre from known keywords
  ✓ parses "$14.99" and "14.99 USD"
  ✓ parses "Q4 2026", "October 2026", "15 Oct 2026"
  ✓ returns a schema-valid GameConcept for arbitrary text
  ✓ confidence never exceeds 0.4
  ✓ unmatched fields land in missingImportantFields
  ✓ empty input does not throw
```

The schema-validity test is the important one: the fallback exists to keep the app running, so it must never produce something downstream can't consume.

Prompt construction is tested for shape — that `previous` is included on a patch turn, that answers are attached — without asserting on responses.

---

## What is deliberately not tested

| Not tested | Why |
| --- | --- |
| React components | Render tests here assert that JSX exists. Visual bugs are caught by looking. |
| The offline pipeline | Runs once, verified by `corpus:verify`, which is a better tool for the job. |
| Third-party API clients | Testing them means mocking them, which tests the mock. |
| LLM output quality | Not assertable. Judged by hand. |
| End-to-end flows | Playwright setup cost exceeds its value at this scope. The demo rehearsal *is* the E2E test. |

This list is in the docs on purpose. "We didn't have time" and "we scoped testing to where correctness is invisible" are different statements, and only one of them survives being asked about.

---

## Fixtures

```
tests/fixtures/
  mini-corpus/          50 games + matching index.bin
  concept.horror-coop.ts
  concept.minimal.ts    only a genre, everything else null
  concept.overloaded.ts every field populated, 20 mechanics
  upcoming.sample.ts    exact / month / quarter / vague dates
```

`concept.minimal` and `concept.overloaded` are the edge-case pair. Most bugs in the scoring layer surface at one end or the other: nothing to work with, or too much.

`upcoming.sample` covers all four date confidences including a quarter that crosses a year boundary, which is the case that broke week-bucketing twice.

---

## Coverage

Target, enforced in CI:

```json
{
  "lib/scoring/**": { "lines": 90, "branches": 85 },
  "lib/corpus/**":  { "lines": 75 },
  "global":         { "lines": 40 }
}
```

Per-directory thresholds rather than one global number. A single global target either forces meaningless component tests or lets the scoring layer slip. The scoring layer is where correctness is invisible; that is where the bar is high.

---

## Running

```bash
pnpm test                    # once
pnpm test:watch              # during development
pnpm test:coverage           # with thresholds enforced
pnpm test lib/scoring        # one directory
pnpm corpus:verify           # data invariants, not part of test
```

CI runs `typecheck`, `lint`, `test:coverage` on every push. See [contributing.md](contributing.md#ci).
