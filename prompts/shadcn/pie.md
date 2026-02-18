# shadcn:pie — Pie Chart

Array of named segments. Use `fill` per item only when the user explicitly requests custom colors.

## Format 1 — Plain (default)

```json
[
  { "name": "Technology", "value": 548, "fill": null },
  { "name": "Utilities", "value": 412, "fill": null },
  { "name": "Materials", "value": 287, "fill": null }
]
```

## Format 2 — With custom colors

Only set `fill` on segments the user wants colored. Leave others as `null`.

```json
[
  { "name": "Technology", "value": 548, "fill": "#6C5DD3" },
  { "name": "Utilities", "value": 412, "fill": "#2dd4a8" },
  { "name": "Materials", "value": 287, "fill": null }
]
```

## Rules

- Every item must have `name` (string) and `value` (number).
- `fill` is required in the schema but can be `null` — use `null` to keep the default color.
- Only set `fill` to a hex value for segments the user wants colored.
- Hex colors only (e.g. `"#6C5DD3"`). No Tailwind classes, no CSS variables.
- Never add `color`, `colorFrom`, or `colorTo` to items.
