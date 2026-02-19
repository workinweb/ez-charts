import { TreeMapChartItem } from "../types";

export const treeMapChartData: TreeMapChartItem[] = [
  {
    id: "1",
    name: "Tech",
    subtopics: [
      { key: "Windows", value: 100 },
      { key: "MacOS", value: 120 },
      { key: "Linux", value: 110 },
    ],
  },
  {
    id: "2",
    name: "Financials",
    subtopics: [
      { key: "Loans", value: 60 },
      { key: "Bonds", value: 80 },
      { key: "PPRs", value: 20 },
    ],
  },
  {
    id: "3",
    name: "Energy",
    subtopics: [
      { key: "Petrol", value: 70 },
      { key: "Diesel", value: 50 },
      { key: "Hydrogen", value: 20 },
    ],
  },
];
