# Gamalytic estimate semantics

The collector uses Gamalytic's free Steam-game list endpoint for selected AppIDs. One batch requests only `steamId`, `copiesSold`, and `revenue`.

Both commercial values are explicitly marked:

- Source: `gamalytic`
- Estimated: `true`
- Method: a short description of the provider estimate

Estimated copies represent modeled Steam purchases, not Steam owners or activated keys. Estimated revenue represents gross USD before platform fees and taxes when the provider returns it.

The free response can include copies sold while omitting revenue. Missing revenue remains null and adds a `missing_field` issue. The backend does not multiply current price by estimated copies, infer discounts, or create another revenue approximation.

Malformed or duplicate estimate records are isolated to their AppID. Records for unrequested games are ignored. The endpoint receives no authentication header because this collector uses the documented free list behavior; any configured paid key remains unused here.
