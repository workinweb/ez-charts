# horizontal-bar

**Use when:** Comparing categories with single values (e.g. sales by region, rankings).

**Schema:** `{ key, value, color? }`

**Example:**
```json
[
  { "key": "Technology", "value": 38.1 },
  { "key": "Financial Services", "value": 27.8 }
]
```

## Customization

**Colors:** Add `color` per item. Format: HEX only (e.g. `"#6C5DD3"`). Rosencharts only — do NOT use `fill` or `_seriesColors`.

**Other props:** `key` = category label. `value` = numeric value. Both required.
