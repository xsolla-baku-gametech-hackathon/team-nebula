# Steam field mapping

Steam is authoritative for the customer-facing game identity and store facts.

| Output | Steam source |
| --- | --- |
| Name and description | Store app-details response |
| Release date and raw date text | Store release object |
| Current and regular USD price | Price overview in US region |
| Platforms, developers, publishers | Store app details |
| Genres and early-access marker | Store genre records |
| Tags | English store-page user tags |
| Review totals and rating label | Global app-reviews summary |
| Comments | Recent English app reviews |

Price integers are converted from cents. Free games receive zero current and regular prices. Missing or non-USD pricing remains null rather than being converted or guessed.

Review totals include all languages and purchase types. Positive ratio is positive divided by total when total is nonzero. The rating label is Steam's summary, not an AI sentiment result.

Comments are independently fetched, sanitized to plain text, deduplicated, ordered newest first, and capped at three. They omit author identifiers and never determine the aggregate review statistics.
