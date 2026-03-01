# shadcn:bar-stacked — Stacked Bar Chart

Same structure as shadcn:bar. Multiple series stacked on top of each other per category.

Use canonical wrapped format with `key: "month"` for the category column.

## chartSettings (optional)

Include when user asks for display options:

- **withLabels** (boolean): Show value labels on top of each stacked segment. Default `true`.
- **withLegend** (boolean): Show series legend. Default `true`. Set `false` if user wants no legend.
- Omit `chartSettings` when user does not specify.
