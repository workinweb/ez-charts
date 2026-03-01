# shadcn:bar-horizontal — Horizontal Bar Chart

Same structure as shadcn:bar. Bars extend horizontally with categories on the Y-axis. Single series only (first series used).

Use canonical wrapped format with `key: "month"` for the category column.

## chartSettings (optional)

Include when user asks for display options:

- **withLabels** (boolean): Show value labels at the end of each bar (right side). Default `true`. Category label (left) always shows.
- **categoryLabelPosition** (`"inside"` | `"outside"`): Where to show the category label. `"inside"` = on the bar (insideLeft). `"outside"` = on the Y-axis. Default `"inside"`.
- Omit `chartSettings` when user does not specify.
