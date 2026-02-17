# horizontal-bar-gradient

**Use when:** Same as horizontal bar but with per-bar gradient colors.

**Schema:** `{ key, value, color? }`

**Example:**
```json
[
  { "key": "Technology", "value": 38.1, "color": "bg-gradient-to-r from-pink-300 to-pink-400" },
  { "key": "Banking", "value": 29.6, "color": "bg-gradient-to-r from-purple-300 to-purple-400" }
]
```

## Customization

**Colors:** Add `color` per item. Format: Tailwind gradient `"bg-gradient-to-r from-X to-Y"` (e.g. `from-pink-300 to-pink-400`).

**Other props:** Same as horizontal-bar.
