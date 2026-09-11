# Scoring model

The scoring engine lives in `lib/domain/scoring`. Its functions are synchronous and provider-independent; current time and source records are passed in explicitly.

## Outputs

- `similarity.ts` compares semantic evidence, mechanics, genre, theme, game mode, and price.
- `saturation.ts` measures cohort density, commercial concentration, and upcoming-release pressure.
- `revenue.ts` returns conservative, base, and upside estimates from available revenue evidence, weighted by competitor similarity.
- `reception.ts` estimates positive-review ratio only when review evidence exists and clamps the result to 0–100%.
- `release-risk.ts` scores UTC-aligned launch weeks and returns `KEEP`, `MOVE`, `MITIGATE`, or `INSUFFICIENT_DATA`.
- `drivers.ts` carries the explanations shown beside calculated outputs.

## Evidence rules

- Unavailable revenue is excluded from percentiles and concentration calculations.
- No revenue evidence produces unavailable ranges rather than `$0` estimates.
- No default price is inserted when the user did not provide one.
- Free games do not enter price-normalization division.
- Revenue observations use similarity as their percentile weight.
- Review predictions are omitted when the cohort cannot support them.
- Release similarity contributes once to launch risk.
- A move distance is measured from the planned launch week.

These invariants are covered in `tests/domain/scoring`.
