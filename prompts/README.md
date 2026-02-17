# Chart Prompts & Schemas

This folder contains context documents for the AI to generate accurate chart data structures. Use these when building prompts that create charts from user input or parsed file data.

## Structure

- **`bar-charts.md`** — Horizontal bar, vertical bar, gradient, multi-series, image bars
- **`line-charts.md`** — Single line, multi-line, curved line
- **`pie-charts.md`** — Pie, donut, half-donut, fillable charts
- **`other-charts.md`** — Breakdown, benchmark, treemap, scatter
- **`schemas-reference.md`** — Quick TypeScript interface reference, chart-key → schema mapping, and **how to change colors** for all chart types

## Usage

Include the relevant prompt file(s) in your system prompt or context when the user requests a specific chart type. Each file contains:

1. **Chart type key** — The exact string to use in the API (e.g. `horizontal-bar`, `line-multi`)
2. **Prompt guidance** — Suggested wording for the AI to describe what data to extract
3. **Schema** — TypeScript interface and JSON structure
4. **Example** — Valid sample data

## Chart Type Keys Reference

| Key | Description |
|-----|-------------|
| `horizontal-bar` | Standard horizontal bar |
| `horizontal-bar-gradient` | Horizontal bar with gradient colors |
| `horizontal-bar-multi` | Multiple values per category |
| `horizontal-bar-image` | Bars with images (SVG or URL) |
| `horizontal-bar-thin` | Thin horizontal bars |
| `vertical-bar` | Vertical bar |
| `vertical-bar-multi` | Vertical multi-series |
| `line` | Single line (time series) |
| `line-multi` | Multiple lines |
| `line-curved` | Curved line (legacy) |
| `pie` | Pie chart |
| `pie-image` | Pie with logos |
| `donut` | Donut chart |
| `half-donut` | Half donut / gauge |
| `fillable` | Fillable gauge |
| `fillable-donut` | Fillable donut |
| `breakdown` | Breakdown / stacked bar |
| `breakdown-thin` | Thin breakdown |
| `benchmark` | Benchmark comparison |
| `treemap` | Hierarchical treemap |
| `scatter` | Scatter plot |
