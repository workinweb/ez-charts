# shadcn:donut — Donut Chart

Same data format as pie. Ring chart with hollow center. Each row = one segment.

## Format

```json
{
  "_data": [
    { "key": "name", "value": "Technology", "series": [{ "name": "value", "value": 548 }] },
    { "key": "name", "value": "Utilities", "series": [{ "name": "value", "value": 412 }] },
    { "key": "name", "value": "Materials", "series": [{ "name": "value", "value": 287 }] }
  ],
  "_seriesColors": null
}
```

## Rules

- Same as shadcn:pie. key="name", value=segment label, series=[{name:"value", value}].
- Hex colors only in _seriesColors.

## chartSettings (optional)

- `withLegend`: Show segment legend below chart. Default true.
- `withCenterText`: Show value in donut center. Default false.
- `centerTextMode`: "total" (sum) or "active" (highlighted segment value). Default "total".
- `withActiveSector`: Enable active sector (click legend to highlight segment). When true, segment pops out. Default false.
