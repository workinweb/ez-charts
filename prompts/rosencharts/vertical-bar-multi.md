# vertical-bar-multi

**Use when:** Multiple series per X category (e.g. actual vs projected by month).

**Schema:** `{ key, values: number[], multipleColors? }` — same as horizontal-bar-multi.

**Example:**
```json
[
  { "key": "Jan 2020", "values": [11.1, 9.5] },
  { "key": "Feb 2020", "values": [18.3, 16.7] }
]
```

## Customization

**Colors:** Add `multipleColors` per item. Array of HEX, one per value. Same as horizontal-bar-multi.

**Other props:** `key` = X-axis label. `values` = stacked/multi bars. Optional: `image` URL for leading icon per row.
