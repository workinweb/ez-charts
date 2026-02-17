# horizontal-bar-multi

**Use when:** Comparing multiple values per category (e.g. Q1, Q2, Q3 by region).

**Schema:** `{ key, values: number[], multipleColors? }`

**Example:**
```json
[
  { "key": "European Union", "values": [15, 25, 33] },
  { "key": "United States", "values": [13, 24, 31], "multipleColors": ["bg-blue-400", "bg-green-400", "bg-amber-400"] }
]
```

## Customization

**Colors:** Add `multipleColors` per item. Array of Tailwind or hex, one per value in `values`. Example: `["bg-blue-400", "bg-green-400", "bg-amber-400"]`.

**Other props:** `values` must match length of `multipleColors` (if provided). `key` = category label. Optional: `image` URL for leading icon per row.
