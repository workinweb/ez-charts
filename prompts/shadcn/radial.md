# shadcn:radial — Radial Bar Chart

Same format as shadcn:pie. Array of named segments. Use `fill` per item only when the user explicitly requests custom colors.

## Format 1 — Plain (default)

```json
[
  { "name": "Tech", "value": 548, "fill": null },
  { "name": "Utils", "value": 412, "fill": null },
  { "name": "Health", "value": 320, "fill": null }
]
```

## Format 2 — With custom colors

Only set `fill` on segments the user wants colored. Leave others as `null`.

```json
[
  { "name": "Tech", "value": 548, "fill": "#6C5DD3" },
  { "name": "Utils", "value": 412, "fill": null },
  { "name": "Health", "value": 320, "fill": "#2dd4a8" }
]
```

## Rules

- Every item must have `name` (string) and `value` (number).
- `fill` is required in the schema but can be `null` — use `null` to keep the default color.
- Only set `fill` to a hex value for segments the user wants colored.
- Hex colors only (e.g. `"#6C5DD3"`). No Tailwind classes, no CSS variables.
- Never add `color`, `colorFrom`, or `colorTo` to items.
