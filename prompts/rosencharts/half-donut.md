# half-donut

**Use when:** Gauge-style, showing filled vs empty (e.g. progress, completion rate). Typically 2 segments.

**Schema:** `{ name, value, colorFrom?, colorTo? }` — same as pie. Usually "Filled" + "Empty".

**Example:**
```json
[
  { "name": "Empty", "value": 30 },
  { "name": "Filled", "value": 70 }
]
```

## Customization

**Colors:** Same as pie. Rosencharts only.

**Other props:** Typically 2 items. Values = proportional split.
