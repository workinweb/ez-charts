# Shadcn Prompts

One `.md` file per chart type. Loaded dynamically when that chart type is selected.

**Color system:** Hex only. Cartesian: `{ _data, _seriesColors }`. Pie/radial: `fill` per item. Never use Tailwind, `color`, or `colorFrom`/`colorTo`.

**chartSettings:** object in the full output `{ message, chartType, title, data, chartSettings? }`. Include when user requests display/style changes. `withTooltip` and `withAnimation` default to true; omit to keep default, set false to disable. Bar: `withLabels`, `withLegend` (stacked only), `categoryLabelPosition` (horizontal only). Line: `lineType` ("curved" | "linear" | "step"). Area: `areaFillStyle`. Omit when not needed.
