// @ts-nocheck
import { LineDataSeries } from "../types";

// Default data for LineChart
export const lineChartData = [
  {
    id: "line1",
    data: [
      { id: "1", date: "2023-04-30", value: 4 },
      { id: "2", date: "2023-05-01", value: 6 },
      { id: "3", date: "2023-05-02", value: 5 },
      { id: "4", date: "2023-05-03", value: 7 },
      { id: "5", date: "2023-05-04", value: 10 },
      { id: "6", date: "2023-05-05", value: 10 },
      { id: "7", date: "2023-05-06", value: 11 },
      { id: "8", date: "2023-05-07", value: 8 },
      { id: "9", date: "2023-05-08", value: 8 },
      { id: "10", date: "2023-05-09", value: 12 },
    ],
  },
];

export const lineChartCurvedData = [
  { id: "1", date: "2023-04-30", value: 6 },
  { id: "2", date: "2023-05-01", value: 3 },
  { id: "3", date: "2023-05-02", value: 9 },
  { id: "4", date: "2023-05-03", value: 5 },
  { id: "5", date: "2023-05-04", value: 11 },
  { id: "6", date: "2023-05-05", value: 8 },
  { id: "7", date: "2023-05-06", value: 14 },
  { id: "8", date: "2023-05-07", value: 7 },
  { id: "9", date: "2023-05-08", value: 10 },
  { id: "10", date: "2023-05-09", value: 12 },
];

export const lineChartMultipleData: LineDataSeries[] = [
  {
    id: "series1",
    data: [
      { id: "1", date: "2024-04-30", value: 4 },
      { id: "2", date: "2024-05-01", value: 5 },
      { id: "3", date: "2024-05-02", value: 7 },
      { id: "4", date: "2024-05-03", value: 6 },
      { id: "5", date: "2024-05-04", value: 9 },
      { id: "6", date: "2024-05-05", value: 11 },
      { id: "7", date: "2024-05-06", value: 10 },
      { id: "8", date: "2024-05-07", value: 7 },
      { id: "9", date: "2024-05-08", value: 6 },
      { id: "10", date: "2024-05-09", value: 9 },
    ],
    color: {
      line: "stroke-violet-400",
      point: "text-violet-300",
    },
  },
  {
    id: "series2",
    data: [
      { id: "1", date: "2024-04-30", value: 3 },
      { id: "2", date: "2024-05-01", value: 3.5 },
      { id: "3", date: "2024-05-02", value: 4 },
      { id: "4", date: "2024-05-03", value: 3.5 },
      { id: "5", date: "2024-05-04", value: 5 },
      { id: "6", date: "2024-05-05", value: 5 },
      { id: "7", date: "2024-05-06", value: 6 },
      { id: "8", date: "2024-05-07", value: 5.5 },
      { id: "9", date: "2024-05-08", value: 4 },
      { id: "10", date: "2024-05-09", value: 5 },
    ],
    color: {
      line: "stroke-fuchsia-400",
      point: "text-fuchsia-300",
    },
  },
  {
    id: "series3",
    data: [
      { id: "1", date: "2024-04-30", value: 2 },
      { id: "2", date: "2024-05-01", value: 2.5 },
      { id: "3", date: "2024-05-02", value: 3 },
      { id: "4", date: "2024-05-03", value: 4 },
      { id: "5", date: "2024-05-04", value: 3.5 },
      { id: "6", date: "2024-05-05", value: 3 },
      { id: "7", date: "2024-05-06", value: 2.5 },
      { id: "8", date: "2024-05-07", value: 3 },
      { id: "9", date: "2024-05-08", value: 2.5 },
      { id: "10", date: "2024-05-09", value: 3 },
    ],
    color: {
      line: "stroke-pink-400",
      point: "text-pink-300",
    },
  },
];
