# shadcn:radial

Radial bar chart. Same format as shadcn:pie.

## Data format

```json
[
  { "name": "Tech", "value": 548, "fill": "#6C5DD3" },
  { "name": "Utils", "value": 412, "fill": "#2dd4a8" }
]
```

## Rules

- Colors via `fill` (hex) on each item. `fill` is optional — omit to keep default.
- NEVER use `color`, `colorFrom`, `colorTo` — those are Rosencharts only.
- When user asks to change colors on attached radial: add/update `fill` on the items they mention.
