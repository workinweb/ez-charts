# shadcn:pie-stacked — Stacked Pie Chart

Two concentric rings (inner + outer). Same data structure as shadcn:bar-stacked: category + exactly 2 series. First series = inner ring, second = outer ring.

Use canonical wrapped format with `key: "month"` (or category name) for the category column.

## Format

```json
{
  "_data": [
    { "key": "month", "value": "Jan", "series": [{ "name": "desktop", "value": 186 }, { "name": "mobile", "value": 80 }] },
    { "key": "month", "value": "Feb", "series": [{ "name": "desktop", "value": 305 }, { "name": "mobile", "value": 200 }] },
    { "key": "month", "value": "Mar", "series": [{ "name": "desktop", "value": 237 }, { "name": "mobile", "value": 120 }] }
  ],
  "_seriesColors": null
}
```

## Rules

- Same as shadcn:bar-stacked: `key` = category column, `value` = category label, `series` = exactly 2 items for inner/outer rings.
- First series = inner ring, second = outer ring.
- `_seriesColors`: JSON string mapping category labels to hex for segment colors. Use `null` when no custom colors.

## chartSettings (optional)

- `withLegend` (boolean): Show category legend below chart. Default `true`.
