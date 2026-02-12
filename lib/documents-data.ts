/** Saved document from chat attachments (when Save documents on DB is enabled) */
export interface SavedDocument {
  id: string;
  name: string;
  size: number;
  /** MIME type or extension hint */
  type: string;
  /** Parsed/text content for download */
  content: string;
  createdAt: string;
}

/** Mock saved documents - in production these would load from an API/DB */
export const savedDocuments: SavedDocument[] = [
  {
    id: "doc-1",
    name: "sales_data.csv",
    size: 12400,
    type: "text/csv",
    content: "Region,Revenue,Q4\nNorth,125000,32%\nSouth,98000,28%\nEast,112000,30%\nWest,89000,25%",
    createdAt: "Today",
  },
  {
    id: "doc-2",
    name: "expenses.xlsx",
    size: 25600,
    type: "application/vnd.openxmlformats",
    content: "Category,Amount\nHealthcare,548\nUtilities,412\nMaterials,287\nReal Estate,193",
    createdAt: "Yesterday",
  },
  {
    id: "doc-3",
    name: "quarterly_report.pdf",
    size: 89000,
    type: "application/pdf",
    content: "Q4 2024 Quarterly Report\n\nExecutive Summary\nRevenue increased by 15%...",
    createdAt: "Jan 11",
  },
  {
    id: "doc-4",
    name: "analytics.json",
    size: 4200,
    type: "application/json",
    content: '{"users": 1250, "charts": 89, "favorites": 34}',
    createdAt: "Jan 09",
  },
  {
    id: "doc-5",
    name: "market_data.csv",
    size: 18700,
    type: "text/csv",
    content: "Sector,Value,Change\nTech,42,5.2\nFinance,38,-1.1\nHealthcare,31,2.8",
    createdAt: "Jan 08",
  },
];

export function getDocumentById(id: string): SavedDocument | undefined {
  return savedDocuments.find((d) => d.id === id);
}
