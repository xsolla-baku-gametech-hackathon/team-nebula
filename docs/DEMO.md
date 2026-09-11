# Demo flow

## Before presenting

1. Install dependencies with `pnpm install --frozen-lockfile`.
2. Copy `.env.example` to `.env.local` and supply the configured provider credentials.
3. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
4. Run `pnpm discovery:smoke` and `pnpm collector:smoke` if live provider verification is required.
5. Start the production build with `pnpm start`.

## Product walkthrough

1. Explain the promise from the landing screen: commercial range, reviewed comparables, market pressure, and a launch recommendation.
2. Enter a specific game concept including player loop, mode, perspective, price, and launch window.
3. Show that concept validation happens before game search.
4. Review the proposed comparable names and approve the cohort.
5. Inspect collected game facts, three review excerpts, and similarity rationale.
6. Build the investment view and lead with the `KEEP`, `MOVE`, or `MITIGATE` recommendation.
7. Support the decision with revenue evidence, weekly launch pressure, saturation, and reception confidence.
8. Export the immutable snapshot as JSON or print it as PDF.

The app stores the active session only in browser storage. Provider data is fetched in real time and is not stored as a game database.
