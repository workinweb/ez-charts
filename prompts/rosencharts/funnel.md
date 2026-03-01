# funnel

**Use when:** Showing progressive reduction or conversion stages (e.g. sales funnel, pipeline stages, conversion rates). Bars are stacked vertically; width = value relative to max (narrower = smaller).

**Schema:** `{ key, value, colorFrom?, colorTo? }`

**Example:**
```json
[
  { "key": "Gross Revenue", "value": 47.1 },
  { "key": "Net Revenue", "value": 32.3 },
  { "key": "EBITDA", "value": 27.1 },
  { "key": "Gross Profit", "value": 17.5 },
  { "key": "Net Profit", "value": 12.7 }
]
```

## Customization

**Colors:** Add `colorFrom` and `colorTo` (HEX) for gradient. Same format as benchmark chart.

**Note:** Data is sorted by value descending (largest at top).
