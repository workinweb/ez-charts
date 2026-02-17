# treemap

**Use when:** Hierarchical data — parent categories with sub-items and values.

**Schema:** `{ name, subtopics: [{ key: number }, ...], colorFrom?, colorTo? }` — at least one subtopics object. Keys in subtopics = sub-item names, values = sizes.

**Example:**
```json
[
  {
    "name": "Tech",
    "subtopics": [{ "Windows": 100, "MacOS": 120, "Linux": 110 }]
  },
  {
    "name": "Financials",
    "subtopics": [{ "Loans": 60, "Bonds": 80 }]
  }
]
```

## Customization

**Colors:** Add `colorFrom` + `colorTo` per parent item. Tailwind gradient. Rosencharts only.

**Other props:** `name` = parent category. `subtopics` = array of one object: `{ subName: number }` pairs. Sub-values determine tile size.
