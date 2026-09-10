# Approved collection pipeline

Approved Steam AppIDs enter the same live collector used by the direct collection endpoint. Input is limited to ten IDs, deduplicated, and kept in selection order.

Steam store details are the required identity boundary. Apps unavailable in the US store, mismatched AppIDs, and non-game app types become per-game failures. Optional work runs only for valid games.

For each valid game the collector requests:

- Steam store details and USD pricing
- Global Steam review aggregates
- Up to three recent English review comments
- Steam user tags from the store page
- IGDB metadata through exact AppID mapping
- Gamalytic estimates in one bounded batch

Optional provider failures do not discard the Steam game. They produce typed collection issues and null or empty fields. When no Steam game succeeds, the API returns a provider-unavailable response.

The approval layer attaches the stored Grok reason, matched tags, and candidate IGDB ID after collection. It excludes a game if a returned IGDB identity conflicts with the approved candidate.
