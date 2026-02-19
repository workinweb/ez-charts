# horizontal-bar-multi

**Use when:** Comparing multiple values per category (e.g. Q1, Q2, Q3 by region).

**Schema:** `{ key, values: number[], multipleColors? }`

**Example:**
```json
[
  { "key": "European Union", "values": [15, 25, 33] },
  { "key": "United States", "values": [13, 24, 31], "multipleColors": ["#3B82F6", "#22C55E", "#F59E0B"] }
]
```

## Customization

**Colors:** Add `multipleColors` per item. Array of HEX, one per value in `values`. Example: `["#3B82F6", "#22C55E", "#F59E0B"]`.

**Other props:** `values` must match length of `multipleColors` (if provided). `key` = category label. Optional: `image` URL for leading icon per row.
