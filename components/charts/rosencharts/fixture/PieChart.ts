import { DonutChartItem, PieChartItem } from "../types";

export const pieChartData: PieChartItem[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    value: 548,
    colorFrom: "text-pink-400",
    colorTo: "text-pink-400",
  },
  {
    id: "utilities",
    name: "Utilities",
    value: 412,
    colorFrom: "text-purple-400",
    colorTo: "text-purple-400",
  },
  {
    id: "materials",
    name: "Materials",
    value: 287,
    colorFrom: "text-indigo-400",
    colorTo: "text-indigo-400",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    value: 193,
    colorFrom: "text-sky-400",
    colorTo: "text-sky-400",
  },
  {
    id: "consumer",
    name: "Consumer",
    value: 156,
    colorFrom: "text-lime-400",
    colorTo: "text-lime-400",
  },
  {
    id: "telecom",
    name: "Telecom",
    value: 78,
    colorFrom: "text-amber-400",
    colorTo: "text-amber-400",
  },
];

export const filledDonutChartData = [
  { id: "filled", name: "Filled", value: 30 },
  { id: "empty", name: "Empty", value: 70 },
];

export const halfDonutChartData = [
  {
    id: "empty",
    name: "Empty",
    value: 30,
  },
  {
    id: "filled",
    name: "Filled",
    value: 70,
  },
];

export const donutChartData: DonutChartItem[] = [
  { id: "nvda", name: "NVDA", value: 25 },
  { id: "eth", name: "ETH", value: 18 },
  { id: "slvr", name: "SLVR", value: 14 },
  { id: "tsla", name: "TSLA", value: 12 },
  { id: "dot", name: "DOT", value: 8 },
  { id: "amzn", name: "AMZN", value: 5 },
];

export const pieChartImageData = [
  {
    id: "apple",
    name: "Apple",
    value: 731,
    logo: "https://etoro-cdn.etorostatic.com/market-avatars/1001/1001_494D5A_F7F7F7.svg",
    colorFrom: "text-pink-400",
    colorTo: "text-pink-400",
  },
  {
    id: "mercedes",
    name: "Mercedes",
    value: 631,
    logo: "https://etoro-cdn.etorostatic.com/market-avatars/1206/1206_2F3350_F7F7F7.svg",
    colorFrom: "text-purple-400",
    colorTo: "text-purple-400",
  },
  {
    id: "palantir",
    name: "Palantir",
    value: 331,
    logo: "https://etoro-cdn.etorostatic.com/market-avatars/7991/7991_2C2C2C_F7F7F7.svg",
    colorFrom: "text-indigo-400",
    colorTo: "text-indigo-400",
  },
  {
    id: "google",
    name: "Google",
    value: 232,
    logo: "https://etoro-cdn.etorostatic.com/market-avatars/1002/1002_3183FF_F7F7F7.svg",
    colorFrom: "text-sky-400",
    colorTo: "text-sky-400",
  },
  {
    id: "tesla",
    name: "Tesla",
    value: 101,
    logo: "https://etoro-cdn.etorostatic.com/market-avatars/1007/1007_F7F7F7_2C2C2C.svg",
    colorFrom: "text-lime-400",
    colorTo: "text-lime-400",
  },
  {
    id: "meta",
    name: "Meta",
    value: 42,
    logo: "https://etoro-cdn.etorostatic.com/market-avatars/1008/1008_F7F7F7_2C2C2C.svg",
    colorFrom: "text-amber-400",
    colorTo: "text-amber-400",
  },
];
