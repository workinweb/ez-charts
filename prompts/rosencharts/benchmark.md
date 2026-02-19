# benchmark

**Use when:** Comparing items against a baseline or each other (e.g. model scores, benchmarks).

**Schema:** `{ key, value, colorFrom?, colorTo? }`

**Example:**
```json
[
  { "key": "Model 0", "value": 85.8 },
  { "key": "Model A", "value": 34.3 },
  { "key": "Model B", "value": 27.1 }
]
```

## Customization

**Colors:** Add `colorFrom` + `colorTo` per item. Format: HEX only (e.g. `"#6C5DD3"`, `"#4F46E5"`). Rosencharts only. Do NOT use `fill` or `color` alone.

**Other props:** `key` = item label. `value` = metric (e.g. score).
