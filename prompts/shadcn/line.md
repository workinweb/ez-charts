# shadcn:line — Line Chart

Same structure as shadcn:bar. Always use the canonical wrapped format. Use `key: "month"` for the category column.

## Format

```json
{
  "_data": [
    { "key": "month", "value": "Jan", "series": [{ "name": "users", "value": 186 }, { "name": "sessions", "value": 80 }] },
    { "key": "month", "value": "Feb", "series": [{ "name": "users", "value": 305 }, { "name": "sessions", "value": 200 }] },
    { "key": "month", "value": "Mar", "series": [{ "name": "users", "value": 237 }, { "name": "sessions", "value": 120 }] }
  ],
  "_seriesColors": null
}
```

## Rules

- `key`: `"month"` for bar/area/line.
- `value`: category label.
- `series`: array of `{ name, value }`. Same series names across all rows.
- `_seriesColors`: JSON string or `null`. Use only when user requests custom colors.
- Hex colors only.

## chartSettings (optional)

Include when user asks for line style:

- **lineType** (`"curved"` | `"linear"` | `"step"`): How the line connects data points.
  - **curved** (default): Smooth curves between points. Rounded, flowing appearance. Best for trends and continuous data.
  - **linear**: Straight line segments between points. Angular, no curves. Clean look for simple time series.
  - **step**: Staircase pattern — horizontal line to next x, then vertical step. Looks like a step function. Good for discrete changes (e.g. cumulative counts, tier levels, on/off states).
- Omit `chartSettings` when user does not specify.
