# shadcn:line — Line Chart

Cartesian format. Identical structure to shadcn:bar. Use plain array by default. Only wrap with `_data`/`_seriesColors` when the user explicitly requests custom colors.

## Format 1 — Plain (default)

```json
[
  { "month": "Jan", "users": 186, "sessions": 80 },
  { "month": "Feb", "users": 305, "sessions": 200 },
  { "month": "Mar", "users": 237, "sessions": 120 }
]
```

## Format 2 — With custom colors

Only use this format if the user asks to color specific series.

```json
{
  "_data": [
    { "month": "Jan", "users": 186, "sessions": 80 },
    { "month": "Feb", "users": 305, "sessions": 200 },
    { "month": "Mar", "users": 237, "sessions": 120 }
  ],
  "_seriesColors": {
    "users": "#3f2bbf"
  }
}
```

## Rules

- First key in each row = category string (e.g. `"month"`). All other keys = numeric series.
- All rows must have identical keys.
- `_seriesColors` is partial — only list series the user wants colored. Omit the rest.
- Keys in `_seriesColors` must exactly match numeric series keys in the rows.
- Hex colors only (e.g. `"#3f2bbf"`). No Tailwind classes, no CSS variables.
- Never add `color`, `fill`, `colorFrom`, or `colorTo` to row items.
