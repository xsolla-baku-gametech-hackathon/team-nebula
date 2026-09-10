# Scoring models

`lib/scoring/`. Pure synchronous functions. No I/O, no `async`, no dates read from the clock — "today" is passed in. Every function returns its score **and** the drivers that produced it.

This directory is the product. Everything else is plumbing around it.

```
lib/scoring/
  similarity.ts       concept ↔ game, 0–1
  saturation.ts       market crowding, 0–100
  revenue.ts          conservative / base / upside
  reception.ts        predicted positive ratio
  release-risk.ts     per-week risk + KEEP/MOVE/MITIGATE
  boxleiter.ts        review→copies fallback estimator
  drivers.ts          shared Driver builder
```

---

## Why explanations are structural

Every function builds `Driver[]` as it computes, not afterwards:

```ts
type Driver = {
  label: string;         // 'Comparable releases in window'
  contribution: number;  // signed, in score points
  detail: string;        // '9 games scoring >70 similarity'
};
```

Two consequences. The UI can always answer "why," because the answer is in the return value. And the contributions must sum to the score, which CI asserts — so a driver list that doesn't explain the number is a test failure, not a documentation lapse.

```ts
// tests/drivers.test.ts
expect(sum(result.drivers.map(d => d.contribution)))
  .toBeCloseTo(result.score, 1);
```

That single assertion is the difference between a scoring engine and a magic number.

---

## 1. Similarity

`similarity.ts` — how close a corpus game is to the user's concept.

Two stages: cheap filter, expensive rank.

### Stage A — hard filter

Over the full corpus, in `lib/corpus`:

```
keep if:
  tagOverlap(concept, game) >= 1
  game.release.isReleased
  game.metadata.summary.length > 50
```

Drops ~85% of the corpus in about 2 ms and, more importantly, prevents semantically-plausible nonsense — a well-written visual novel description can sit surprisingly close to a horror shooter in embedding space if nothing constrains it.

If tag overlap yields fewer than 60 survivors, the threshold relaxes to `0` and the whole corpus goes to stage B. Rare, but it stops niche concepts returning three results.

### Stage B — weighted rerank

Cosine over survivors gives semantic rank; take the top 40 and score properly:

```
similarity =
    0.40 × semantic
  + 0.20 × mechanics
  + 0.15 × genre
  + 0.10 × theme
  + 0.10 × gameMode
  + 0.05 × price
```

| Component | How | Notes |
| --- | --- | --- |
| `semantic` | dot product of normalized vectors, clamped `[0,1]` | the differentiator |
| `mechanics` | Jaccard over normalized mechanic terms | highest precision signal |
| `genre` | weighted overlap; primary genre match = 0.6, each secondary = 0.4/n | |
| `theme` | Jaccard over IGDB themes | often empty; see reweighting |
| `gameMode` | exact set overlap | co-op vs singleplayer is a hard commercial split |
| `price` | `1 − min(1, |Δprice| / 20)` | $15 vs $60 games are not competitors |

Output stays in the normalized 0–1 range and is rounded to four decimal places. UI components multiply by 100 only for display.

**Why these weights.** Semantic dominates because it is the claim — description matching over tag matching. Mechanics is second because it is the most precise structural signal; two games sharing "proximity voice chat" and "session-based runs" are competitors regardless of how they're tagged. Price is small but non-zero: it doesn't determine similarity, it prevents a $60 AAA title outranking a $15 indie on semantics alone.

The weights are constants at the top of the file with a comment explaining each. They are not tuned on a held-out set — there isn't one — and the doc says so. Claiming otherwise under questioning would be worse than the honest version.

### Missing-component reweighting

If IGDB data is absent, `theme` and `mechanics` are empty and would score 0, dragging every game down uniformly and compressing the range.

Instead, missing components are dropped and remaining weights renormalized:

```ts
const active = components.filter(c => c.available);
const total  = sum(active.map(c => c.weight));
score = sum(active.map(c => (c.weight / total) * c.value));
```

Unavailable components are omitted from the driver list and from the weighted denominator. Their raw component slot remains zero for the stable API shape.

### Rationale string

One sentence, template-generated from the top two components:

> *"Very close on gameplay description and shares 4 of 6 core mechanics (proximity voice chat, session-based runs, creature identification)."*

Not LLM-generated. Templates are deterministic, instant, and cannot hallucinate a mechanic the game doesn't have.

---

## 2. Competitive threat

Similarity is *how alike*. Threat is *how much it hurts you*.

For approved historical comparables, competitive threat is currently the normalized similarity expressed on a 0–100 scale. For upcoming IGDB releases, threat starts with semantic similarity and adds a capped hype boost. Release-risk scoring consumes that upstream threat once; it does not apply similarity again.

---

## 3. Saturation

`saturation.ts` — how crowded is this space, right now.

```
saturation = clamp(0, 100,
    35 × densityFactor
  + 30 × successRateFactor
  + 20 × upcomingPressureFactor
  + 15 × concentrationFactor
)
```

| Factor | Definition | Range |
| --- | --- | --- |
| `density` | comparables (sim ≥ 70) released in trailing 12 months, normalized against the corpus-wide median for that tag cluster | 0–1 |
| `successRate` | **inverted** share of comparables with known revenue exceeding a floor (default $50k). Missing estimates are omitted | 0–1 |
| `upcomingPressure` | comparables launching in the next 90 days vs the trailing-12-month average rate | 0–1 |
| `concentration` | Herfindahl index over positive known comparable revenue. Missing estimates are omitted | 0–1 |

Bands: `<30 LOW`, `30–55 MODERATE`, `55–80 HIGH`, `>80 CRITICAL`.

Drivers render as prose:

> **76 / 100 — HIGH**
> - 42 strongly comparable games released in the last 12 months *(+31)*
> - Only 18% cleared $50k in estimated revenue *(+24)*
> - Upcoming comparable releases run 27% above the historical rate *(+14)*
> - Revenue is concentrated: the top title holds 61% of cohort revenue *(+7)*

Four sentences a developer can act on, versus `Market saturated: yes`.

`concentration` is the subtle one and worth keeping. A space with forty even competitors is a grind. A space where one game owns 61% is a different problem — you are not competing for share, you are competing for the attention that game already has.

---

## 4. Revenue

`revenue.ts` — comparable-based, never LLM-based.

```
1. keep comparables with known non-negative revenue and positive similarity
2. weight each: w_i = similarity_i^2
3. when both prices are known and above zero, normalize revenue to the user's price:
     adj_i = revenue_i × (userPrice / price_i)^0.6
   otherwise keep the reported revenue without price normalization
4. similarity-weighted percentiles over adj:
     conservative = P25
     base         = P50
     upside       = P80
5. apply modifiers
6. round to 2 significant figures
```

**Squared weights** because linear weighting lets a wall of 60-similarity games drown out three 95s. Squaring makes the close comparables actually dominate.

**Price elasticity `^0.6`** rather than linear. Doubling price does not double revenue; the exponent is a standard rough approximation for premium game demand. It is a stated assumption, in a comment, in the code.

No target price is invented. A missing target price, missing comparable price, or free game skips price normalization and is disclosed in a driver. When no comparable combines revenue evidence with a positive similarity weight, all three estimates are `null` rather than `$0`.

Modifiers, multiplicative:

| Modifier | Condition | Factor |
| --- | --- | --- |
| Saturation | `saturation > 70` | ×0.85 |
| Saturation | `saturation < 30` | ×1.10 |
| First title | `isFirstTitle === true` | ×0.75 |

Confidence:

| | Condition |
| --- | --- |
| `HIGH` | ≥ 10 usable scored comparables |
| `MEDIUM` | ≥ 6 usable scored comparables |
| `LOW` | otherwise |

### Presentation

```
Estimated first-year gross revenue

  Conservative   $85,000
  Base          $230,000
  Upside        $610,000

  MEDIUM confidence · 12 comparables · ReleaseSignal model
```

Never `$273,841`. Two significant figures, always a range, always the comparable count visible. The number of comparables is the honest confidence signal, and putting it on screen pre-empts the obvious challenge.

If the estimate rests on our Boxleiter fallback rather than Gamalytic, the label says so and the tooltip shows the multiplier. Compounding an estimate on an estimate is fine as long as it is visible.

---

## 5. Reception

`reception.ts` — predicted review sentiment.

Deliberately modest. We predict the **cohort median positive ratio**, adjusted slightly by price positioning, and present it as a reference point rather than a prediction about the user's game.

```
predicted = cohortMedianPositiveRatio × priceAdjustment
priceAdjustment = clamp(0.92, 1.05, 1 - 0.004 × (userPrice - cohortMedianPrice))
```

Both cohort values are true medians over valid known values. Missing prices are omitted rather than converted to zero. If either side of the price comparison is unavailable, no price adjustment is applied. The result is clamped to 0–100%; when no valid review ratios exist, both reception values are `null` and the report states that evidence is insufficient.

Framed in the UI as: *"Comparable games in this space average 87% positive. Games priced above their cohort median tend to review slightly lower."*

We cannot predict whether an unbuilt game is good. Pretending otherwise is exactly the kind of overreach a technical judge will find in ten seconds. The honest framing is more useful anyway — it is a bar to clear, not a fortune.

---

## 6. Release risk

`release-risk.ts` — the differentiator. Scores every week in a forward horizon.

```
for each UTC Monday week w in [today, today + horizon]:
  risk(w) = clamp(0, 100,
    Σ threat(g) × dateConfidence(g) ÷ overlappingWeeks(g)
  )
```

### competitorThreatDensity

Sum of upstream threat scores of upcoming releases in the week, weighted by date confidence and spread across every possible week for imprecise dates. Upstream threat already incorporates semantic similarity and hype, so release scoring does not multiply by similarity again.

```ts
pressure(w) = Σ_{g in upcoming(w)} threat(g) × dateWeight(g) ÷ overlapCount(g)
```

### Date-confidence weighting

Announced dates slip. Rather than pretending precision, uncertain dates are spread:

| Confidence | Treatment |
| --- | --- |
| `exact` | full weight on its week |
| `month` | weight ÷ 4, spread across the month's weeks |
| `quarter` | weight ÷ 13, spread across the quarter |
| `vague` | weight 0, counted separately in the UI |

This is the intellectually honest handling and it is also load-bearing for credibility. *"Why should I believe your calendar when release dates slip?"* is the sharpest available question, and the answer is: we weight by announcement precision, we never claim a week is certain, and undated competition is shown separately rather than hidden or guessed at.

### The verdict

```
current  = risk(week containing plannedRelease)
best     = min risk over horizon, excluding the next 3 weeks
                                  (nobody moves a launch on 14 days' notice)

if plannedRelease is null        → INSUFFICIENT_DATA
if current − best < 15           → KEEP
if current − best >= 15 and
   best is within 8 weeks of
   the planned launch week       → MOVE      to best
otherwise                        → MITIGATE
```

`MITIGATE` is the case where a better week exists but is too far out to be worth a delay. The advice becomes tactical rather than temporal: shift the announcement beat, avoid the specific competitor, reconsider price.

Output:

```
SEP 14–20   ██████████████████░░  91  CRITICAL
SEP 21–27   ██████████████░░░░░░  74  HIGH
SEP 28–OCT 4 ████████░░░░░░░░░░░  41  LOW
OCT 5–11    █████████████░░░░░░░  68  HIGH

  VERDICT: MOVE
  Current:      September 17
  Recommended:  September 30

  Your week has 3 close comparables including one with
  40k+ followers. The week of the 30th has none above 70 similarity.
```

Clicking a week expands to the specific competing games, with dates, confidence labels and similarity scores. That expansion is the demo's climax — it is the thing no incumbent shows.

---

## Testing

Every function here is pure, so testing is cheap and there is no excuse for gaps. See [testing.md](testing.md).

Non-obvious cases that must be covered:

- Similarity with zero corpus matches → empty result, not a crash
- Similarity with all components missing except semantic → reweight to 1.0
- Revenue with 3 comparables → `LOW` confidence, still returns a range
- Revenue where every comparable has `null` revenue → returns nulls, not zeros
- Saturation with zero upcoming releases → `upcomingPressure` = 0, not `NaN`
- Release risk with `plannedRelease === null` → `KEEP` plus a recommendation
- Release risk where the best week is week 1 → excluded by the 3-week rule
- Date spreading across a quarter boundary at year end
- Driver contributions summing to the score, for all four engines
