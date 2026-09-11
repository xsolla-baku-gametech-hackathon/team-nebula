# Error and status catalog

All discovery responses disable HTTP caching. Public messages are intentionally safe and exclude provider bodies, prompts, keys, tokens, and stack traces.

| Code | HTTP | Meaning |
| --- | ---: | --- |
| `INVALID_INPUT` | 400 | Malformed JSON or request contract |
| `INVALID_SELECTION` | 400 | Approved IDs are duplicate, empty, or outside the preview |
| `PREVIEW_NOT_FOUND` | 404 | No preview exists for the UUID |
| `PREVIEW_EXPIRED` | 410 | The 30-minute preview window elapsed |
| `PREVIEW_BUSY` | 409 | Another request currently owns the preview |
| `PREVIEW_CONSUMED` | 409 | A normal collection already used the preview |
| `AI_NOT_CONFIGURED` | 503 | The xAI key is missing |
| `AI_UNAVAILABLE` | 503 | Grok failed, timed out, or produced unusable output |
| `INVALID_AI_OUTPUT` | 503 | The ranking response could not be parsed |
| `DISCOVERY_UNAVAILABLE` | 503 | IGDB discovery is unavailable |
| `PROVIDERS_UNAVAILABLE` | 502 | No approved Steam game could be collected |
| `INTERNAL` | 500 | Unexpected sanitized failure |

A successful preview can still report `no_matches` or `complete:false`; these are valid discovery outcomes, not transport errors. A preview that dropped ranked selections or matched tags is one of them: it returns 200 with the surviving candidates, `complete:false`, and an explanatory entry in `discovery.issues`. A successful approved collection can contain per-game failures alongside usable games.

Provider issue codes inside games use lowercase values such as `not_found`, `rate_limited`, `missing_field`, and `invalid_data`.
