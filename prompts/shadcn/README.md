# Shadcn Prompts

One `.md` file per chart type. Loaded dynamically when that chart type is selected.

**Color system:** Hex only. Cartesian: `{ _data, _seriesColors }`. Pie/radial: `fill` per item. Never use Tailwind, `color`, or `colorFrom`/`colorTo`.

**chartSettings:** Optional object in output. Bar charts support `withLabels`, `withLegend` (stacked only), `categoryLabelPosition` (horizontal only). Include only when user requests display changes.
