# fillable

**Use when:** Progress gauge (single metric as percentage of total). Typically 2 items: filled + empty.

**Schema:** `{ name, value, colorFrom?, colorTo? }` — same as pie. Usually "Filled" + "Empty".

**Example:**
```json
[
  { "name": "Filled", "value": 30 },
  { "name": "Empty", "value": 70 }
]
```

## Customization

**Colors:** Same as pie — `colorFrom` + `colorTo` per item. Format: HEX only (e.g. `"#EC4899"`). Rosencharts only.

**Other props:** Typically 2 items. Sum = 100 for percentage gauge.
