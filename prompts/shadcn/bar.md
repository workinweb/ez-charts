# shadcn:bar — Vertical Bar Chart

Always use the canonical wrapped format. Use `key: "month"` for the category column.

## Format

```json
{
  "_data": [
    { "key": "month", "value": "Jan", "series": [{ "name": "series1", "value": 212 }, { "name": "series2", "value": 134 }, { "name": "series3", "value": 78 }] },
    { "key": "month", "value": "Feb", "series": [{ "name": "series1", "value": 265 }, { "name": "series2", "value": 188 }, { "name": "series3", "value": 96 }] },
    { "key": "month", "value": "Mar", "series": [{ "name": "series1", "value": 241 }, { "name": "series2", "value": 153 }, { "name": "series3", "value": 89 }] }
  ],
  "_seriesColors": null
}
```

## Rules

- `key`: category column name, use `"month"` for bar/area/line.
- `value`: category label (e.g. "Jan", "Feb").
- `series`: array of `{ name, value }` — one per numeric series. All rows must have same series names.
- `_seriesColors`: JSON string or `null`. Use `"{\"series1\":\"#6C5DD3\"}"` only when user requests custom colors.
- Hex colors only (e.g. `#6C5DD3`). No Tailwind, no CSS variables.

## chartSettings (optional)

Include in output when user asks for display options:

- **withLabels** (boolean): Show value labels on top of bars. Default `true`. Set `false` if user wants no labels.
- Omit `chartSettings` when user does not specify.
