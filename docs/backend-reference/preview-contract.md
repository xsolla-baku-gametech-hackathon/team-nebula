# Discovery preview contract

`POST /api/games/discover` returns one of three successful states.

## Needs clarification

The response contains validation details and one to three questions. `previewId` and `expiresAt` are null. IGDB search has not run.

## Ready for approval

The response contains a UUID preview ID, expiration timestamp, validated description, and up to ten compact candidates. Each candidate contains only:

- Steam AppID
- IGDB ID
- Game name
- Grok match reason
- Matched discovery tags

Full descriptions stay inside the bounded ranking input and are not returned in the compact candidate list. Prices, reviews, comments, and estimates have not been requested.

## No matches

The description was ready, but no ranked candidate had one exact Steam identity. No preview is stored and the response includes a nonfatal discovery issue.

All successful states include live-mode timing metadata and `Cache-Control: no-store`. Candidate shortfalls are explicit through `returnedCount`, `complete`, and `issues`.
