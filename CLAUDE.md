@AGENTS.md

# Commit discipline

- Commit early and often. More commits is better — every logical change gets its own commit.
- Use conventional commits: `feat(scope)`, `fix(scope)`, `docs(scope)`, `test(scope)`, `refactor(scope)`, `chore(scope)`, `perf(scope)`.
- Scopes: `scoring`, `corpus`, `ai`, `api`, `ui`, `pipeline`, `docs`, `ci`.
- Keep commits small and focused. If the subject needs "and", it's two commits.
- Commit after completing each file, function, or logical unit — don't batch up large changes.
- Push regularly so progress is visible in the repo history.

# Project: ReleaseSignal

Launch-timing intelligence for Steam developers. See docs/ for full specs.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind · Zustand · Recharts · Zod · Vitest

## Key rules

- `lib/scoring/` functions are pure: no async, no I/O, no `new Date()`. "Today" is a parameter.
- Every rendered number carries a `Sourced<T>` provenance tag.
- The app runs without API keys if corpus files are present.
- No `any` — use `unknown` + narrow.
- Routes are thin: validate with Zod, call lib, wrap in envelope, return.
