# pie

**Use when:** Part-to-whole, proportions, composition (e.g. budget by category, market share).

**Schema:** `{ name, value, colorFrom?, colorTo? }`

**Example:**
```json
[
  { "name": "Healthcare", "value": 548 },
  { "name": "Utilities", "value": 412 },
  { "name": "Materials", "value": 287 }
]
```

## Customization

**Colors:** Add `colorFrom` + `colorTo` per item for gradient. Format: HEX only (e.g. `"#EC4899"`, `"#BE185D"`). Rosencharts only — do NOT use `fill` (Shadcn).

**Other props:** `name` = segment label. `value` = proportion (can sum to any total).
