# shadcn:line

Line chart. Same format as shadcn:bar.

## Data format

Plain: `[{ month, series1, series2, ... }]`
With colors: `{ _data: [<rows>], _seriesColors: { "series1": "#hex" } }`

## Rules

- `_seriesColors` is PARTIAL: only include the series the user wants colored.
- Keys = exact numeric column names. HEX only.
- NEVER add `color`/`colorFrom`/`colorTo` to items.
- Attached raw array + color request → wrap with `_data` + `_seriesColors`.
