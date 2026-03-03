# Rosencharts Prompts

One `.md` file per chart type. Loaded dynamically when that chart type is selected.

**Color system:** HEX only (e.g. `#6C5DD3`). Use `color`, `colorFrom`/`colorTo`, or `multipleColors`. Never Tailwind, `fill`, or `_seriesColors` (those are Shadcn).

**chartSettings:** object in the full output `{ message, chartType, title, data, chartSettings? }`. Include when user requests display/style changes. `withTooltip` and `withAnimation` default to true; omit to keep default, set false to disable. Area: `areaFillStyle` ("gradient" | "full" | "outline"), `areaColor`, `areaGradientTop`, `areaGradientBottom`, `areaOutlineColor` (all HEX). Omit when not needed.
