# area

**Use when:** Showing trends over time with filled area under the line (e.g. sales over time, growth metrics). Same data as line chart.

**Schema:** `{ data: [{ date, value }], color? }` (single series)

**Example:**
```json
[
  {
    "data": [
      { "date": "2024-01-01", "value": 4 },
      { "date": "2024-01-02", "value": 6 },
      { "date": "2024-01-03", "value": 8 }
    ]
  }
]
```

## Fill styles (Settings tab)

Data format is the same for all. User picks style in editor:

- **Gradient** — Two-color fill (top → bottom). Good for emphasis, growth.
- **Full** — Solid single-color fill. Bold, high contrast.
- **Outline** — Line + subtle faded fill below (one color, fades to transparent). Minimal, clean.

## Colors (Colors tab)

- **Gradient:** Top color, Bottom color
- **Full:** Area color
- **Outline:** Line color (fill auto-fades from it)
