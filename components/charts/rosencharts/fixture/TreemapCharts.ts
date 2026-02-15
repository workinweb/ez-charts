import { TreeMapChartItem } from "../types";

export const treeMapChartData: TreeMapChartItem[] = [
  {
    id: "1",
    name: "Tech",
    subtopics: [{ Windows: 100, MacOS: 120, Linux: 110 }],
  },
  {
    id: "2",
    name: "Financials",
    subtopics: [{ Loans: 60, Bonds: 80, PPRs: 20 }],
  },
  {
    id: "3",
    name: "Energy",
    subtopics: [{ Petrol: 70, Diesel: 50, Hydrogen: 20 }],
  },
];
