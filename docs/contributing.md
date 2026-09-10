# Contributing

Conventions for a five-person parallel build. The rules exist to prevent merge pain and to keep the repository legible to someone reading it cold.

---

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev                     # runs against fixtures if data/ is empty
```

The app boots without a corpus and without API keys, serving fixtures. This is deliberate: nobody blocks on the data pipeline, and a fresh clone works immediately.

---

## Branches

```
main                    always green, always deployable
feat/<area>-<thing>     feat/scoring-release-risk
fix/<area>-<thing>      fix/corpus-index-mismatch
docs/<thing>            docs/scoring-models
```

Small PRs, merged often. A branch open longer than about two hours is going to conflict with someone.

`main` is protected: CI must pass. No force-push.

---

## Commits

Conventional Commits. Not decoration — the history is a judged artifact, and it is also the fastest way to see who touched what.

```
<type>(<scope>): <subject>

feat(scoring): add quarter-confidence date spreading
fix(corpus): reject index.bin with mismatched length
test(scoring): cover revenue modifier composition
docs(api): document degraded response flags
refactor(ui): extract ProvenanceTag from CompetitorCard
chore(deps): add zod
perf(corpus): reuse Float32Array subarray in cosine loop
```

Types: `feat` `fix` `docs` `test` `refactor` `chore` `perf` `style`.
Scopes: `scoring` `corpus` `ai` `api` `ui` `pipeline` `docs` `ci`.

Rules:

- Imperative mood. *add*, not *added* or *adds*.
- Subject under 72 characters, no trailing period.
- One logical change per commit. If the subject needs "and", it is two commits.
- Body when the *why* is not obvious from the diff. Especially for anything non-obvious in scoring.

Commit frequently. A commit per working unit, not a commit per session. Small commits are easier to review, easier to revert, and they make the history readable rather than a wall of "wip".

---

## Code style

Enforced by ESLint and Prettier; `pnpm lint --fix` before pushing.

Beyond formatting:

**Types before implementation.** `lib/types.ts` is frozen early. Adding an optional field is fine; changing an existing shape means telling everyone, because four other people are coding against it.

**Scoring functions are pure.** No `async`, no I/O, no `new Date()` inside. "Today" is a parameter. This is what makes them testable and it is not negotiable.

```ts
// yes
export function scoreReleaseWindows(
  concept: GameConcept,
  upcoming: UpcomingRelease[],
  today: Date,
  horizonWeeks: number,
): ReleaseWindow[]

// no — untestable, and it will produce different results at midnight
export async function scoreReleaseWindows(concept: GameConcept) {
  const upcoming = await fetchUpcoming();
  const today = new Date();
}
```

**No magic numbers.** Named constants at the top of the file with a comment explaining the choice.

```ts
/** Semantic match dominates: description-over-tags is the core claim. */
const W_SEMANTIC = 0.40;

/** Nobody reschedules a launch on under three weeks' notice. */
const MIN_MOVE_NOTICE_WEEKS = 3;
```

Anyone reading `lib/scoring/` should be able to answer "why 0.40" without asking.

**Components don't fetch.** All network calls live in Zustand actions. One interception point for `DEMO_MODE`.

**Routes are thin.** Validate, call a lib function, wrap, return. Logic in `lib/`.

**No `any`.** `unknown` plus a narrow, or fix the type. TypeScript runs in strict mode and CI fails on errors.

---

## Definition of done

A PR is done when:

- [ ] Types check (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Tests pass, coverage thresholds met (`pnpm test:coverage`)
- [ ] New pure functions in `lib/scoring/` have tests including edge cases
- [ ] New scores return `Driver[]` that sums to the score
- [ ] New rendered numbers carry a `ProvenanceTag`
- [ ] Docs updated if behaviour or contracts changed
- [ ] No `console.log` left behind
- [ ] Works with an empty corpus (fixtures) and with a real one

The provenance and driver items are on this list because they are the two things that make the product defensible and the two things easiest to forget when you are moving fast.

---

## CI

`.github/workflows/ci.yml`, on every push and PR:

```yaml
- pnpm install --frozen-lockfile
- pnpm typecheck
- pnpm lint
- pnpm test:coverage
- pnpm build
- pnpm check:no-server-secrets
```

`check:no-server-secrets` greps `app/` and `lib/` for `STEAM_WEB_API_KEY`, `TWITCH_CLIENT_SECRET` and `GAMALYTIC_API_KEY`. Those belong to the offline pipeline only; if they appear in runtime code, something has been wired wrong and the build should stop.

Badge in the README. It is thirty seconds of work and it is the first signal anyone reading the repository sees.

---

## Documentation

Docs live in `docs/`, are written as markdown, and are updated in the same PR as the change they describe. A doc that describes a system that no longer exists is worse than no doc.

Every doc states its **reasoning**, not just its rules. "Weights are 0.40/0.20/0.15/..." is a fact anyone can read from the source. "Semantic dominates because description-over-tags is the claim we're making" is the thing worth writing down.

New ADRs go in [decisions.md](decisions.md) with the rejected alternative named. A decision record without the alternative is a description, not a decision.

---

## Repository hygiene

```
.gitignore
  node_modules/
  .next/
  .env.local
  data/raw/          # intermediate pipeline output, GBs
  data/*.bin         # too large for git, see below
  coverage/
```

`data/games.json` (~14 MB) is committed — it is text, it diffs poorly but it is the thing that makes the repo runnable on clone.

`data/index.bin` (~25 MB) is not. It is binary and it regenerates from `games.json` in about 90 seconds:

```bash
pnpm corpus:embed        # games.json → index.bin
```

Release artifacts carry both. `pnpm dev` prints a clear error with that command if `index.bin` is missing.

---

## README

The README is the front door. It should, above the fold, show:

- What the product does, in one line
- The problem, with the number
- A hero GIF of the forward calendar in use
- A live link
- The CI badge
- A doc index

Anyone landing on the repository should understand the product in fifteen seconds without cloning anything.
