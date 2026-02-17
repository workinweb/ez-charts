# horizontal-bar-image

**Use when:** Bars with company logos, flags, or images.

**Schema:** `{ key, value, color? }` — images auto-generated from `key`; no need to provide `image` URLs.

**Example:**
```json
[
  { "key": "Portugal", "value": 55.8 },
  { "key": "France", "value": 34.3 }
]
```

## Customization

**Colors:** Add `color` per item. Tailwind or hex. Rosencharts only.

**Other props:** `key` used for label and auto-generated image. Optional: `image` URL to override. Do NOT use `fill`.
