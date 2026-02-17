# vertical-bar

**Use when:** Categories on X-axis, values on Y-axis (e.g. months, quarters).

**Schema:** `{ key, value, color? }`

**Example:**
```json
[
  { "key": "Software", "value": 34.7 },
  { "key": "Energy", "value": 17.2 }
]
```

## Customization

**Colors:** Add `color` per item. Tailwind or hex. Rosencharts only.

**Other props:** `key` = X-axis label. `value` = bar height.
