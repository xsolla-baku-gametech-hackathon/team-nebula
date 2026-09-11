# Data sources

ReleaseSignal separates provider facts from ReleaseSignal estimates. Missing source values remain unavailable; they are not replaced with zero or an assumed price.

| Source | Responsibility | Runtime behavior |
| --- | --- | --- |
| Steam | Identity, page URL, descriptions, price, release date, reviews, tags, developers, publishers | Collected on demand for approved AppIDs |
| IGDB MCP | Semantic discovery, taxonomy enrichment, Steam identity resolution, upcoming PC releases | Queried after validation or during analysis |
| Gamalytic | Estimated copies sold and estimated gross revenue | Optional enrichment; unavailable values remain `null` |
| xAI | Concept validation, discovery tags, and candidate ranking | Used before candidate approval; never supplies game facts |

All numeric and text facts use the source metadata defined in `lib/domain/types.ts`. Estimates include an `estimated` flag and optional method. Provider failures become typed issues so partial results can remain useful without presenting missing evidence as fact.

Required server configuration is documented in `.env.example`. Secrets belong in `.env.local` and must never be committed.
