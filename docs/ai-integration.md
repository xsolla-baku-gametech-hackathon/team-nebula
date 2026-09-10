# AI integration

Two touchpoints, both narrow, both cached, both with non-AI fallbacks.

| Touchpoint | Model | When | Fallback |
| --- | --- | --- | --- |
| Concept extraction | `claude-sonnet-4-6` | Section 1, on each analyze click | keyword extractor |
| Embedding | `text-embedding-3-small` | Section 2, once per concept version | tag-only matching |
| Document import | `claude-sonnet-4-6` | Section 0, optional | manual entry |
| Review sentiment | `claude-sonnet-4-6` | offline, corpus build | Steam's own summary string |

The deliberate absence: **no LLM produces a number.** Revenue, saturation and risk come from arithmetic over comparables. Asking a model "how much will this game make" produces a confident, unfalsifiable, unexplainable figure — exactly the thing that gets the product dismissed. The LLM's job is turning prose into structure. That is all.

---

## 1. Concept extraction

`lib/ai/concept-analyzer.ts`

Free text in, `GameConcept` out, plus clarifying questions when confidence is low.

### The diff loop

Naively you'd resend the whole conversation each turn and re-extract from scratch. That is slow, expensive, and non-deterministic — the same input can yield different taxonomies on different turns, which makes the UI flicker.

Instead the concept object is the state, and each turn applies a diff to it.

```
turn 1:  rawText              → extract → GameConcept v1
turn 2:  GameConcept v1
       + newText (the delta)
       + answers to questions → patch  → GameConcept v2
```

The turn-2 prompt receives the existing concept as JSON and is instructed to return only changed fields, plus which fields the new text justifies changing. Unchanged fields are carried over verbatim by the merge, not regenerated.

Result: the taxonomy is stable across turns. A user adding "oh, and it's first-person" does not silently rewrite their genres.

```ts
export async function analyzeConcept(input: {
  text: string;
  previous?: GameConcept;
  answers?: Record<string, string>;
}): Promise<{ concept: GameConcept; questions: ClarifyingQuestion[] }>;
```

### Extraction prompt

System:

```
You extract structured game-design metadata from developer descriptions.

Output ONLY a JSON object matching the provided schema. No prose,
no markdown fences, no explanation.

Rules:
- Never invent a value. If the text does not state or clearly imply a
  field, set it to null and add it to missingImportantFields.
- confidence is per field, 0..1. Explicitly stated: >0.9. Strongly
  implied: 0.6-0.9. Guessed from genre convention: <0.5.
- mechanics should be specific and player-facing ("proximity voice chat",
  "permadeath", "deck construction"), never generic ("fun", "immersive",
  "engaging gameplay").
- shortDescription: rewrite the developer's text as 1-3 neutral sentences
  describing what the player does. Strip marketing language, superlatives
  and tone words. This text is used for semantic matching against a
  corpus of store descriptions, so match that register.
- Use only the enum values given for platforms, gameModes and perspective.
```

User message carries the schema, the previous concept if any, and the new text.

Temperature 0. Structured output enforced by the schema; response re-validated with Zod on receipt. On validation failure, one retry with the errors appended; on second failure, drop to the keyword fallback.

### The shortDescription instruction matters

It is doing real work. Developers write *"a bone-chilling co-op nightmare where friends become victims."* Steam store pages, which are what we embed against, read *"cooperative horror investigation for up to four players."* Rewriting into store register measurably improves retrieval, because the query and the corpus then live in the same linguistic neighbourhood.

This is the cheapest quality win in the system and the answer to "why not just embed what the user typed."

### Clarifying questions

Generated from `confidence` and `missingImportantFields`, not by the LLM freely inventing them. Rules:

- At most **two** per turn. Three is an interrogation.
- Only for fields that change downstream output: `primaryGenre`, `gameModes`, `priceUsd`, `plannedRelease`, `mechanics`.
- Never ask about something already answered. `answeredFields` is tracked in the store.
- Every question is skippable, and skipping does not block progression.

```ts
type ClarifyingQuestion = {
  field: ConceptField;
  question: string;
  suggestions?: string[];   // renders as chips, not a text box
  skippable: true;
};
```

Suggestions as chips rather than free text is a small thing that makes the demo flow noticeably faster. Two clicks instead of typing a sentence.

### Cost and latency

~1,200 input tokens, ~400 output. Roughly 1.5 s. Cached by `sha256(text + previousVersion)` in an in-process LRU, so re-running an unchanged concept is free and instant — which is what happens every time you rehearse.

---

## 2. Embedding

`lib/ai/embed.ts`

One call per concept version. The string is built to mirror the corpus-side builder exactly:

```ts
export function buildConceptEmbedText(c: GameConcept): string {
  const t = c.taxonomy;
  return [
    c.concept.title ?? 'Untitled',
    c.concept.shortDescription,
    'Genres: '    + [t.primaryGenre, ...t.secondaryGenres].filter(Boolean).join(', '),
    'Themes: '    + t.themes.join(', '),
    'Mechanics: ' + t.mechanics.slice(0, 12).join(', '),
    'Modes: '     + t.gameModes.join(', '),
  ].join('\n');
}
```

Field order, labels and separators are identical to `scripts/embed.py`. `tests/embed-symmetry.test.ts` asserts this by running both builders over a shared fixture and comparing structure. If someone edits one builder, CI fails.

Returned vector is L2-normalized client-side to match the corpus, then cosine is a dot product.

Cached by `sha256(embedText)`. Same concept, same vector, no call.

---

## 3. Document import

`lib/ai/document-import.ts`

Section 0's first CTA. Accepts `.json`, `.md`, `.txt`.

- **JSON** → validate against the `GameConcept` schema, populate directly. No LLM. This is the round-trip for our own export, so a user can leave and come back.
- **Markdown / text** → same extraction prompt as touchpoint 1, with a prefix noting the input is a design document rather than a chat message, and that only game-design content should be extracted.

PDF and DOCX are not supported. They need a parsing dependency and a preview UI for what was extracted, and neither earns its cost against "paste your text."

Files over 50 KB are truncated to the first 20,000 characters with a visible notice. Design docs bury the pitch at the top; the tail is usually asset lists and schedules.

---

## 4. Review sentiment (offline)

Runs during corpus build, on the ~500 enriched titles. For each, 100 recent review texts summarized into:

```json
{
  "praised": ["atmosphere", "co-op tension", "creature design"],
  "criticized": ["repetitive after 10 hours", "optimization", "bugs at launch"],
  "summary": "Strong on atmosphere and first-session tension; the most common complaint is content depth over longer play."
}
```

Baked into `games.json`. Zero runtime cost. Powers "what players actually complained about in your comparables," which is the feature that gets the most spontaneous reaction in testing — it turns competitor cards from statistics into advice.

Steam's own `review_score_desc` is the fallback if this stage is skipped.

---

## Failure behaviour

| Failure | Behaviour | User sees |
| --- | --- | --- |
| Extraction API error | Retry once, then keyword fallback | *Using simplified analysis — you can edit fields directly* |
| Extraction returns invalid JSON | Retry with errors, then fallback | same |
| Embedding API error | Tag-only candidate selection, semantic weight redistributed | *Reduced-precision matching* |
| Both down | Tag-only + manual concept entry | Both banners; app still completes end to end |

**The app never blocks on an AI call.** Every path has a degraded completion. In `DEMO_MODE` (see [demo-runbook.md](demo-runbook.md)), both calls are served from a fixture map keyed by input hash, so the demo path makes zero network requests of any kind.

### The keyword fallback

`lib/ai/fallback-extract.ts`, ~80 lines, no dependencies.

Matches the raw text against a curated dictionary of genre, mechanic, mode and perspective terms; parses `$X.XX` for price; parses month and quarter expressions for dates. Produces a valid `GameConcept` with `confidence` values capped at `0.4` and everything unmatched in `missingImportantFields`.

It is not as good. It is deterministic, offline, instant, and it means an API outage degrades quality instead of ending the demo. It also has full unit tests, which the LLM path cannot have.

---

## Prompt storage

All prompts live in `lib/ai/prompts/` as exported template functions, one file each, versioned in git. Not inline string literals scattered through service code.

```
lib/ai/prompts/
  extract-concept.ts
  patch-concept.ts
  import-document.ts
  review-sentiment.ts      # used by the offline pipeline via a JSON export
```

Prompts are code. They get reviewed in PRs, they get diffed, and when output quality changes you can see exactly which commit changed the instruction.
