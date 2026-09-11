# Route map

## Pages

| URL | Entry | Layout | Summary |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `app/layout.tsx` | Client-side, persisted four-phase journey: landing, description validation, comparable review, and market analytics. |

## API routes

| URL | Entry |
| --- | --- |
| `/api/analyze` | `app/api/analyze/route.ts` |
| `/api/concept/analyze` | `app/api/concept/analyze/route.ts` |
| `/api/concept/import` | `app/api/concept/import/route.ts` |
| `/api/discover` | `app/api/discover/route.ts` |
| `/api/export/json` | `app/api/export/json/route.ts` |
| `/api/games/[appId]` | `app/api/games/[appId]/route.ts` |
| `/api/games/collect` | `app/api/games/collect/route.ts` |
| `/api/games/discover` | `app/api/games/discover/route.ts` |
| `/api/games/discover/collect` | `app/api/games/discover/collect/route.ts` |
| `/api/games/search` | `app/api/games/search/route.ts` |
| `/api/health` | `app/api/health/route.ts` |

The App Router filesystem is the router configuration; there is no separate route config.
