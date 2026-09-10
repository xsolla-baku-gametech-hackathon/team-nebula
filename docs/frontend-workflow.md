# Frontend workflow

Five sections, one linear flow, progressive disclosure. Nothing appears until the data behind it exists.

```
Section 0   Landing        import or start fresh
Section 1   Concept        describe your game, answer questions
Section 2   Refine         edit taxonomy, curate competitors
Section 3   Comparables    what similar games actually did
Section 4   Forecast       saturation, revenue, and the calendar
```

Sections 1–2 are Tab 1, section 3 is Tab 2, section 4 is Tab 3. Tabs unlock as their data arrives and stay clickable once unlocked, so the user can go back without losing state.

---

## State

Single Zustand store, persisted to localStorage.

```ts
type Store = {
  phase: 'landing' | 'describe' | 'comparables' | 'analytics';
  description: string;
  genres: string[];
  concept: GameConcept | null;
  validation: DiscoveryValidation | null;
  questions: string[];
  competitors: ScoredCompetitor[];
  report: MarketReport | null;
  snapshot: Snapshot | null;
  resultsStale: boolean;
};
```

Three rules:

- **Server calls use the typed API client in `lib/api/client.ts`.** The page orchestrator owns transient request state; only stable session data is persisted.
- **`snapshot` is deep-frozen.** Sections 3 and 4 read from it exclusively. Nothing recomputes; nothing derives a number a second time.
- **Editing the concept never mutates the snapshot.** It bumps `concept.version`, which sets `snapshotStale`, which shows a re-analyze banner. The old numbers stay on screen and stay internally consistent until explicitly replaced.

That last rule is why the exported PDF always matches what was on screen.

---

## Section 0 — Landing

Two CTAs, the problem statement, nothing else.

```
        720 games launched on Steam last week.
       530 of them finished with under ten reviews.

   Find out who you're actually launching against.

  ┌──────────────────────┐  ┌──────────────────────┐
  │  Import a document   │  │   Start from scratch │
  └──────────────────────┘  └──────────────────────┘
```

**Import** — drop zone accepting `.json`, `.md`, `.txt`. JSON populates directly. Markdown and text go through extraction and land the user in section 1 with fields pre-filled, so they see the extraction rather than trusting it blind.

**Start from scratch** — straight to section 1.

If a persisted session exists, a third affordance appears: *Resume your last session*, with the concept title and a timestamp. Costs nothing, saves the demo when someone refreshes the page.

---

## Section 1 — Concept

```
┌────────────────────────────────────────────────────┐
│  Describe your game                                │
│  ┌──────────────────────────────────────────────┐  │
│  │ A co-op horror game where 4 players explore   │  │
│  │ an abandoned Soviet research facility.        │  │
│  │ Proximity voice chat. Runs are 30–40 min.     │  │
│  │ PC first, around $14.99.                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  A couple of quick questions:                      │
│                                                    │
│  What's the camera perspective?                    │
│  [First person] [Third person] [Isometric] [Skip]  │
│                                                    │
│  When are you planning to launch?                  │
│  [ Oct 2026 ▾ ]                        [Skip]      │
│                                                    │
│                      [ Analyze concept → ]         │
└────────────────────────────────────────────────────┘
```

The textarea is never cleared or rewritten. Follow-up text appends; the diff loop handles the delta (see [ai-integration.md](ai-integration.md#the-diff-loop)).

Questions render as chips where the field is enumerable. Two at a time, always skippable. Answering a chip does not fire a request — answers batch into the next analyze click.

Once a concept exists, section 2 slides in below rather than replacing this. The user can see their words and the extracted structure at once, which is the moment where trust in the extraction is established or lost.

---

## Section 2 — Refine

Everything here is editable. This is the point of the section: the LLM proposed, the user disposes.

```
┌────────────────────────────────────────────────────┐
│  Genre & mechanics          extracted, editable    │
│                                                    │
│  Genre     [Horror ×] [Co-op ×] [Survival ×]  [+]  │
│  Themes    [Supernatural ×] [Abandoned facility ×] │
│  Mechanics [Proximity voice chat ×]                │
│            [Creature identification ×]             │
│            [Session-based runs ×]              [+] │
│  Modes     [Online Co-op ×]                        │
│  Price     [$14.99]        Launch  [Oct 2026]      │
├────────────────────────────────────────────────────┤
│  Similar games                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🔍 Add a game you consider a competitor...    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  We'll find comparables automatically — add any    │
│  you already have in mind.                         │
│                                                    │
│                   [ Find my competitors → ]        │
└────────────────────────────────────────────────────┘
```

Tag chips are removable and addable. Every edit bumps `concept.version`.

The search box hits `/api/games/search` with a 200 ms debounce. Results show name, year and review count so the user can tell two similarly-named games apart. Selecting one adds to `manualAppIds`.

Low-confidence fields (`< 0.5`) render with a dotted underline and a tooltip: *"we guessed this — worth checking."* Small touch, disproportionate effect on perceived honesty.

---

## Section 3 — Comparables

Tab 2. What genuinely similar games actually did.

```
┌────────────────────────────────────────────────────┐
│  12 comparables · ranked from 312 candidates       │
│                          [ ⇅ Similarity ▾ ]        │
├────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐ │
│ │ [img]  Phasmophobia                    94      │ │
│ │        Sep 2020 · $19.99          similarity   │ │
│ │                                                │ │
│ │        Revenue    $182M  ⓘ gamalytic           │ │
│ │        Copies     12.4M  ⓘ gamalytic           │ │
│ │        Reviews    812k · 95% ⓘ steam           │ │
│ │                                                │ │
│ │        Very close on gameplay description;      │ │
│ │        shares 4 of 6 core mechanics.           │ │
│ │                                                │ │
│ │        [Steam ↗]  [Details]      [Remove ×]    │ │
│ └────────────────────────────────────────────────┘ │
│ ...                                                │
│                                                    │
│                    [ Run market analysis → ]       │
└────────────────────────────────────────────────────┘
```

Every number carries `ⓘ`. Hovering shows source and, for our own estimates, the method.

The similarity badge is hoverable and expands the component breakdown:

```
  semantic     0.91  ████████████████░░
  mechanics    0.83  ███████████████░░░
  genre        1.00  ████████████████████
  theme        0.67  █████████████░░░░░░
  game mode    1.00  ████████████████████
  price        0.75  ██████████████░░░░░
```

This is a fifteen-minute component that answers the single best question a technical judge can ask — *why is that first?* — without anyone having to talk.

**Details** opens a drawer: full description, review sentiment breakdown (*what players praised / criticized*), CCU history chart if the game is enriched. Charts render only when data exists; no empty axes.

Removing a competitor updates `excludedAppIds` and re-ranks locally. No server call — the scores are already computed.

---

## Section 4 — Forecast

Tab 3. Four blocks, in this order, because it builds to the calendar.

### Saturation

```
  MARKET SATURATION            76 / 100   HIGH
  ████████████████████████████████░░░░░░░░

  · 42 comparable games released in the last 12 months     +31
  · Only 18% cleared $50k estimated revenue                +24
  · Upcoming releases run 27% above the historical rate     +14
  · Top title holds 61% of cohort revenue                    +7
```

Drivers always visible, never behind a toggle.

### Revenue

```
  ESTIMATED FIRST-YEAR GROSS

     Conservative        Base          Upside
        $85,000        $230,000       $610,000
     ├──────────────────●────────────────────┤

     MEDIUM confidence · 12 comparables
     ⓘ ReleaseSignal model over Gamalytic estimates
```

A range on an axis, not three numbers in a row. The visual carries the uncertainty in a way that text does not.

### Reception

One line, framed as a bar to clear rather than a prediction:

```
  Comparable games average 87% positive reviews.
  That's your bar.                       ⓘ steam, 12 games
```

### The forward calendar

The climax. Full width, most polish.

```
┌──────────────────────────────────────────────────────────┐
│  WHO YOU'RE LAUNCHING AGAINST                            │
│                                                          │
│  Sep 14  ████████████████████░  91  CRITICAL   ← you     │
│  Sep 21  ██████████████░░░░░░░  74  HIGH                 │
│  Sep 28  ████████░░░░░░░░░░░░░  41  LOW        ★ best    │
│  Oct 05  █████████████░░░░░░░░  68  HIGH                 │
│  Oct 12  ███████░░░░░░░░░░░░░░  38  LOW                  │
│  ...                                                     │
│                                                          │
│  ┌─ Sep 14–20 ─────────────────────────────────────────┐ │
│  │  3 close comparables launching                      │ │
│  │                                                     │ │
│  │  Dread Facility        Sep 16  exact   sim 88       │ │
│  │  The Quiet Ward        Sep 18  exact   sim 81       │ │
│  │  Nightshift            Sep 2026 month  sim 76       │ │
│  │                                                     │ │
│  │  + 4 undated games that may land in this window     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  MOVE                                               │ │
│  │  September 17  →  September 30                      │ │
│  │                                                     │ │
│  │  Your week has three close comparables including    │ │
│  │  one with 40k+ followers. The week of the 30th has  │ │
│  │  none scoring above 70.                             │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

Rows expand on click. The user's planned week is marked; the recommended week is starred. The verdict card lands last.

The **undated games** line is deliberate. It is the honest disclosure — some competition can't be placed on a calendar — and it demonstrates that we handle date uncertainty rather than ignoring it. It converts the sharpest available criticism into a feature.

Bar colours are not the only signal; the numeric score and the band label carry the same information for anyone who can't distinguish the colours.

### Exports

```
  [ Export PDF ]  [ Export JSON ]
```

Both read the frozen snapshot. Both stamp `snapshotId` and `corpusVersion` into the output.

---

## PDF export

`window.print()` against a print stylesheet. The print-only report includes the concept and assumptions, forecast metrics and verdict, every comparable game with up to three review comments, and the live upcoming-release calendar. No server route, PDF library, or headless browser is required.

```css
@media print {
  nav, .tabs, button, .no-print { display: none; }
  .section { break-inside: avoid; page-break-inside: avoid; }
  .chart   { break-inside: avoid; }
  body     { background: #fff; color: #000; font-size: 11pt; }
  .print-header { display: block; }   /* hidden on screen */
  a[href]::after { content: " (" attr(href) ")"; font-size: 9pt; }
}
```

`.print-header` renders the title, concept summary, generation timestamp and corpus version — visible only on paper.

Recharts renders SVG, which prints correctly. Verify in Chrome's print preview early; leaving it to the end is how you discover a chart that clips at a page break with an hour left.

The tradeoff is real: no custom pagination, no headers on every page, and it depends on the browser's print dialog. Against that, it is thirty minutes instead of four hours and it cannot fail at runtime.

---

## Component tree

```
app/
  layout.tsx
  page.tsx                    orchestrates sections by phase
  api/...

components/
  landing/
    Hero.tsx
    ImportDropzone.tsx
    ResumeCard.tsx
  concept/
    ConceptInput.tsx
    ClarifyingQuestions.tsx
    TaxonomyEditor.tsx
    CompetitorSearch.tsx
  comparables/
    CompetitorGrid.tsx
    CompetitorCard.tsx
    SimilarityBadge.tsx        hover → component breakdown
    CompetitorDrawer.tsx
  forecast/
    SaturationPanel.tsx
    RevenueRange.tsx
    ReceptionLine.tsx
    ReleaseCalendar.tsx        the climax
    WeekDetail.tsx
    VerdictCard.tsx
    ExportBar.tsx
  shared/
    ProvenanceTag.tsx          the ⓘ — used everywhere
    DriverList.tsx
    ScoreBar.tsx
    DegradedBanner.tsx
    StaleSnapshotBanner.tsx
    LoadingSkeleton.tsx
```

`ProvenanceTag` and `DriverList` are used in a dozen places each. Build them first; they are what makes the whole thing look considered rather than assembled.

---

## Loading states

Skeletons matching final layout, never spinners in the content area. A spinner says *something is happening*; a skeleton says *your data is arriving here, in this shape*.

Discovery is the longest wait (~600 ms cold) and gets staged text:

```
  Understanding your concept...
  Searching 4,218 games...
  Ranking by gameplay similarity...
```

Staged progress makes a sub-second wait feel purposeful. It also happens to narrate the pipeline to anyone watching, which is useful when someone is watching.

---

## Reset

Always visible at the bottom: **Start new session**. It clears the store and localStorage and returns to section 0.

Needs to be one click during a demo. Between two run-throughs you do not want to be clearing storage in devtools.

---

## Responsive

Desktop-first — this is a professional tool used on a monitor, and the demo is on a projector. Below 1024 px the layout stacks to a single column and the calendar becomes a vertical list with the bar as a background fill.

It should not be broken on a phone, because a judge may pull it up on theirs. It does not need to be excellent there.
