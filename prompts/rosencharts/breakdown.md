# breakdown

**Use when:** Stacked/segmented bar showing composition (e.g. budget by department, allocation).

**Schema:** `{ key, value, color? }`

**Example:**
```json
[
  { "key": "Healthcare", "value": 23.8 },
  { "key": "Finance", "value": 31.5 },
  { "key": "Materials", "value": 18.7 }
]
```

## Customization

**Colors:** Add `color` per item. Format: Tailwind gradient `"from-fuchsia-300/80 to-fuchsia-400/80"`. Rosencharts only.

**Other props:** `key` = segment label. `value` = proportion. Values stacked horizontally.
