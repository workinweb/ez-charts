# shadcn:pie

Pie chart with labeled segments.

## Data format

```json
[
  { "name": "Technology", "value": 548, "fill": "#6C5DD3" },
  { "name": "Utilities", "value": 412, "fill": "#2dd4a8" },
  { "name": "Materials", "value": 287 }
]
```

## Rules

- Colors via `fill` (hex) on each item. `fill` is optional — omit to keep default.
- NEVER use `color`, `colorFrom`, `colorTo` — those are Rosencharts only.
- When user asks to change colors on attached pie: add/update `fill` on the items they mention.
