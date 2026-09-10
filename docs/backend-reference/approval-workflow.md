# Candidate approval workflows

The approval endpoint accepts exactly one of two request shapes.

Approve every candidate in the preview:

```json
{"previewId":"uuid","approveAll":true}
```

Approve a selected subset:

```json
{"previewId":"uuid","selectedSteamAppIds":[1361000,1195460]}
```

Selected arrays contain one to ten unique positive AppIDs. Every ID must belong to the referenced preview. The collector receives candidates in their original preview ranking order even when the submitted subset uses another order.

Approval claims the preview before provider calls begin. Invalid selections release the claim. Unexpected collection errors also release it so the caller can retry within the TTL. A normal full or partial result consumes it.

Only displayed and approved games are collected. Failures are reported against those AppIDs; lower-ranked candidates are not inserted automatically after approval. This keeps the user's decision authoritative and makes collection results reproducible relative to the preview.
