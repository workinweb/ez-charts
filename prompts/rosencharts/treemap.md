# treemap

**Use when:** Hierarchical data — parent categories with sub-items and values.

**Schema:** `{ name, subtopics: [{ key, value }, ...], colorFrom?, colorTo? }` — each parent has an array of subtopics; each subtopic is `{ key: string, value: number }`.

**Example:**

```json
[
  {
    "name": "Tech",
    "subtopics": [
      { "key": "Windows", "value": 100 },
      { "key": "MacOS", "value": 120 },
      { "key": "Linux", "value": 110 },
      { "key": "Chrome OS", "value": 45 },
      { "key": "Other", "value": 30 }
    ]
  },
  {
    "name": "Financials",
    "subtopics": [
      { "key": "Loans", "value": 60 },
      { "key": "Bonds", "value": 80 },
      { "key": "Equities", "value": 95 },
      { "key": "Derivatives", "value": 40 }
    ]
  }
]
```

## Customization

**Colors:** Add `colorFrom` + `colorTo` per parent item. Format: HEX only (e.g. `"#6C5DD3"`). Rosencharts only.

**Other props:** `name` = parent category. `subtopics` = array of `{ key, value }` — include multiple items for richer charts.
