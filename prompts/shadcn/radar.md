# shadcn:radar

Radar/spider chart. Same format as shadcn:bar but category key = "subject".

## Data format

Plain: `[{ subject, A, B, C, ... }]`
With colors: `{ _data: [<rows>], _seriesColors: { "A": "#hex", "B": "#hex" } }`

## Rules

- `_seriesColors` is PARTIAL: only include the dimensions the user wants colored.
- Keys = exact dimension names (A, B, C...). HEX only.
- NEVER add `color`/`colorFrom`/`colorTo` to items.
- Attached raw array + color request → wrap with `_data` + `_seriesColors`.
