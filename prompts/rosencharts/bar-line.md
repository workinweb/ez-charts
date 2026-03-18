# bar-line

**Use when:** Hybrid chart with bars and a line on the same X-axis (e.g. revenue bars + growth rate line).

**Schema:** `{ key, barValue, lineValue, barColor?, lineColor? }`

**Example:**
```json
[
  { "key": "Jan", "barValue": 34.7, "lineValue": 12 },
  { "key": "Feb", "barValue": 41.2, "lineValue": 18 },
  { "key": "Mar", "barValue": 38.1, "lineValue": 15 }
]
```

## Customization

**Colors:** Add `barColor` per item for bar colors. Use `chartSettings.lineColor` (HEX) for the line — a single color for the whole line. Format: HEX only (e.g. `"#a78bfa"` for bars, `"#06b6d4"` for line). Rosencharts only.

**Other props:** `key` = X-axis label. `barValue` = bar height. `lineValue` = line point Y-value.
