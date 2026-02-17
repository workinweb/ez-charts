# scatter

**Use when:** X vs Y correlation, distribution of points (e.g. price vs volume, risk vs return).

**Schema:** `{ xValue, yValue, name, color? }`

**Example:**
```json
[
  { "xValue": 10, "yValue": 102.8, "name": "Company A" },
  { "xValue": 20, "yValue": 101.9, "name": "Company B" }
]
```

## Customization

**Colors:** Add `color` per point. Tailwind or hex. Rosencharts only. Do NOT use `fill`.

**Other props:** `xValue`, `yValue` = numeric coordinates. `name` = point label for tooltip.
