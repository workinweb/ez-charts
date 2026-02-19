# pie-image

**Use when:** Pie with logos or icons per segment (e.g. brands, companies).

**Schema:** `{ name, value, colorFrom?, colorTo? }` — images auto-generated from `name`; no need to provide `logo` URLs.

**Example:**
```json
[
  { "name": "Apple", "value": 731 },
  { "name": "Mercedes", "value": 631 }
]
```

## Customization

**Colors:** Same as pie — `colorFrom` + `colorTo` per item. Format: HEX only (e.g. `"#EC4899"`). Rosencharts only.

**Other props:** `name` used for label and auto-generated image. Optional: `logo` URL to override.
