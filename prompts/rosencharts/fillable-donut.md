# fillable-donut

**Use when:** Donut-style progress gauge.

**Schema:** `{ name, value, colorFrom?, colorTo? }` — same as pie. Typically 2 items: "Filled" + "Empty".

**Example:**
```json
[
  { "name": "Filled", "value": 65 },
  { "name": "Empty", "value": 35 }
]
```

## Customization

**Colors:** Same as pie — `colorFrom` + `colorTo` per item. Format: HEX only (e.g. `"#EC4899"`). Rosencharts only.

**Other props:** Same as fillable.
