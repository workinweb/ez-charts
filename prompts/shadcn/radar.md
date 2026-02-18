# shadcn:radar — Radar / Spider Chart

Cartesian format. Same structure as shadcn:bar but the category key must be `"subject"`. Use plain array by default. Only wrap with `_data`/`_seriesColors` when the user explicitly requests custom colors.

## Format 1 — Plain (default)

```json
[
  { "subject": "Speed", "teamA": 80, "teamB": 60 },
  { "subject": "Strength", "teamA": 90, "teamB": 75 },
  { "subject": "Endurance", "teamA": 70, "teamB": 85 }
]
```

## Format 2 — With custom colors

Only use this format if the user asks to color specific series.

```json
{
  "_data": [
    { "subject": "Speed", "teamA": 80, "teamB": 60 },
    { "subject": "Strength", "teamA": 90, "teamB": 75 },
    { "subject": "Endurance", "teamA": 70, "teamB": 85 }
  ],
  "_seriesColors": {
    "teamA": "#3f2bbf"
  }
}
```

## Rules

- Category key must be `"subject"`. All other keys = numeric series.
- All rows must have identical keys.
- `_seriesColors` is partial — only list series the user wants colored. Omit the rest.
- Keys in `_seriesColors` must exactly match numeric series keys in the rows.
- Hex colors only (e.g. `"#3f2bbf"`). No Tailwind classes, no CSS variables.
- Never add `color`, `fill`, `colorFrom`, or `colorTo` to row items.
