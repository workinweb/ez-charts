# shadcn:radar — Radar / Spider Chart

Same structure as shadcn:bar but use `key: "subject"` for the category column.

## Format

```json
{
  "_data": [
    { "key": "subject", "value": "Speed", "series": [{ "name": "teamA", "value": 80 }, { "name": "teamB", "value": 60 }] },
    { "key": "subject", "value": "Strength", "series": [{ "name": "teamA", "value": 90 }, { "name": "teamB", "value": 75 }] },
    { "key": "subject", "value": "Endurance", "series": [{ "name": "teamA", "value": 70 }, { "name": "teamB", "value": 85 }] }
  ],
  "_seriesColors": null
}
```

## chartSettings (optional)

- `withLegend` (boolean): Show series legend. Default `false`.
- `radarGridType`: "polygon" | "polygon-no-lines" | "circle" | "circle-no-lines" | "filled" | "circle-filled" | "none". Default "polygon".
- `radarLinesOnly` (boolean): No fill, stroke only. Default `false`.

## Rules

- `key`: must be `"subject"` for radar.
- `value`: dimension label (e.g. "Speed", "Strength").
- `series`: array of `{ name, value }`. Same series names across all rows.
- `_seriesColors`: JSON string or `null`. Use only when user requests custom colors.
- Hex colors only.
