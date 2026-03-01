# bubble

**Use when:** Comparing categories with size/proportion (e.g. market share by sector, portfolio allocation, resource distribution). Bubbles are packed by value; larger values = larger circles.

**Schema:** `{ name, sector, value, color? }`

**Example:**
```json
[
  { "name": "MacOS", "sector": "Tech", "value": 4812 },
  { "name": "Linux", "sector": "Tech", "value": 3212 },
  { "name": "Windows", "sector": "Tech", "value": 512 },
  { "name": "Bonds", "sector": "Financials", "value": 2517 },
  { "name": "Loans", "sector": "Financials", "value": 1213 }
]
```

## Customization

**Colors:** `sector` groups items by color (same sector = same color). Override per item with `color` (HEX only, e.g. `"#6C5DD3"`).

**Other props:** `name` = label (shown on larger bubbles). `value` = bubble size. `sector` = category for color grouping.
