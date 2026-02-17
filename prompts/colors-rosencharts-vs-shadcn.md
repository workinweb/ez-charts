# Color Behavior: Rosencharts vs Shadcn

**CRITICAL:** Rosencharts and Shadcn use completely different color systems. Use the correct system for each chart type — mixing them causes charts to render incorrectly or not at all.

---

## Quick Reference

| Library | Color Format | Field Names | Where |
|---------|--------------|-------------|-------|
| **Rosencharts** | Tailwind classes (`bg-purple-400`, `stroke-violet-400`) or hex | `color`, `colorFrom`/`colorTo`, `multipleColors` | Per item or per series in data array |
| **Shadcn** | Hex only (`#6C5DD3`) or `var(--chart-N)` | `_seriesColors` (Cartesian), `fill` (pie/radial) | Wrapped object for Cartesian; per-item for pie/radial |

---

## Rosencharts

**Format:** Tailwind utility classes (e.g. `bg-purple-400`, `stroke-violet-400`, `text-pink-400`) or hex strings.

**DO:**
- Use `color` for bars, scatter, breakdown, line
- Use `colorFrom` + `colorTo` for pie, donut, benchmark, treemap (gradient)
- Use `multipleColors` for multi-bar (array of Tailwind/hex, one per value)
- Line: `"stroke-violet-400"` or `{ line: "stroke-violet-400", point: "text-violet-300" }`

**Examples:**
```json
{ "key": "A", "value": 10, "color": "bg-purple-400" }
{ "name": "X", "value": 50, "colorFrom": "text-pink-400", "colorTo": "text-pink-600" }
{ "key": "Q1", "values": [1,2,3], "multipleColors": ["bg-blue-400", "bg-green-400", "bg-amber-400"] }
```

**DO NOT:** Use `fill` or `_seriesColors` — those are Shadcn-only.

---

## Shadcn

**Format:** Hex only (`#6C5DD3`) or CSS variables (`var(--chart-1)`).

**DO:**
- **Cartesian (bar, area, line, radar):** Wrap data with `{ _data: [...], _seriesColors: { "desktop": "#6C5DD3", "mobile": "#2dd4a8" } }`. Keys = series names from the data.
- **Pie, radial:** Add `fill` (hex) to each item: `{ name: "Tech", value: 548, fill: "#6C5DD3" }`

**Examples:**
```json
{ "_data": [{ "month": "Jan", "desktop": 186 }], "_seriesColors": { "desktop": "#6C5DD3" } }
[{ "name": "Tech", "value": 548, "fill": "#6C5DD3" }, { "name": "Utils", "value": 412, "fill": "#2dd4a8" }]
```

**DO NOT:**
- Use Tailwind classes (e.g. `bg-purple-400`) — Shadcn does not understand them.
- Use `color`, `colorFrom`, `colorTo`, or `multipleColors` — those are Rosencharts-only.
- Add `color` to Cartesian data items — use `_seriesColors` on the wrapped object instead.

---

## Common Mistakes (Avoid)

| Wrong | Right |
|-------|-------|
| Shadcn pie with `colorFrom` | Shadcn pie with `fill` (hex) |
| Shadcn bar with `{ key, value, color }` | Shadcn bar with `{ _data: [...], _seriesColors: {...} }` |
| Rosencharts pie with `fill` | Rosencharts pie with `colorFrom` + `colorTo` |
| Shadcn Cartesian with `color` on items | Shadcn Cartesian with `_seriesColors` keys = series names |

---

## Brand Palette (hex, works for both)

`#6C5DD3`, `#BCBDEA`, `#5574e8`, `#2dd4a8`, `#e87c5c`, `#8b95a8`, `#7c6ee8`, `#354052`
