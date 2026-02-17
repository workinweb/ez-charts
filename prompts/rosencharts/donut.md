# donut

**Use when:** Same as pie but with hollow center (e.g. portfolio allocation).

**Schema:** `{ name, value, colorFrom?, colorTo? }` — same as pie.

**Example:**
```json
[
  { "name": "NVDA", "value": 25 },
  { "name": "ETH", "value": 18 },
  { "name": "SLVR", "value": 14 }
]
```

## Customization

**Colors:** Same as pie — `colorFrom` + `colorTo` per item. Rosencharts only. Do NOT use `fill`.

**Other props:** Same as pie.
