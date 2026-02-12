// Define types for the different bar chart data structures

import { companyLogos } from "../utils/utils";
import {
  GradientBarData,
  HorizontalBarData,
  ImageBarData,
  MultiBarData,
  SVGBarData,
  VerticalBarData,
  VerticalMultiBarData,
} from "../types";

export const dataHorizontal: HorizontalBarData[] = [
  {
    id: "tech",
    key: "Technology",
    value: 38.1,
    color: "bg-gradient-to-r from-purple-400 to-purple-400",
  },
  {
    id: "finance",
    key: "Financial Services",
    value: 27.8,
    color: "bg-gradient-to-r from-purple-400 to-purple-400",
  },
  {
    id: "renewable",
    key: "Renewable Energy",
    value: 23.1,
    color: "bg-gradient-to-r from-purple-400 to-purple-400",
  },
  {
    id: "consumer-cyclical",
    key: "Consumer Cyclical",
    value: 19.5,
    color: "bg-gradient-to-r from-purple-400 to-purple-400",
  },
  {
    id: "consumer-staples",
    key: "Consumer Staples",
    value: 16.2,
    color: "bg-gradient-to-r from-purple-400 to-purple-400",
  },
  {
    id: "utilities",
    key: "Utilities",
    value: 5.8,
    color: "bg-gradient-to-r from-purple-400 to-purple-400",
  },
].sort((a, b) => b.value - a.value);

export const dataGradient: GradientBarData[] = [
  {
    id: "tech",
    key: "Technology",
    value: 38.1,
    color: "bg-gradient-to-r from-pink-300 to-pink-400",
  },
  {
    id: "banking",
    key: "Banking",
    value: 29.6,
    color: "bg-gradient-to-r from-purple-300 to-purple-400",
  },
  {
    id: "energy",
    key: "Energy",
    value: 23.1,
    color: "bg-gradient-to-r from-indigo-300 to-indigo-400",
  },
  {
    id: "retail",
    key: "Retail",
    value: 21.3,
    color: "bg-gradient-to-r from-sky-300 to-sky-400",
  },
  {
    id: "healthcare",
    key: "Healthcare",
    value: 17.9,
    color: "bg-gradient-to-r from-orange-200 to-orange-300",
  },
  {
    id: "utilities",
    key: "Utilities",
    value: 5.8,
    color: "bg-gradient-to-r from-lime-300 to-lime-400",
  },
].toSorted((a, b) => b.value - a.value);

export const dataMulti: MultiBarData[] = [
  {
    id: "eu",
    key: "European Union",
    values: [15, 25, 33],
    image: "https://hatscripts.github.io/circle-flags/flags/eu.svg",
  },
  {
    id: "us",
    key: "United States",
    values: [13, 24, 31],
    image: "https://hatscripts.github.io/circle-flags/flags/us.svg",
  },
  {
    id: "jp",
    key: "Japan",
    values: [7, 18, 24],
    image: "https://hatscripts.github.io/circle-flags/flags/jp.svg",
  },
  {
    id: "ph",
    key: "Philippines",
    values: [4, 11, 19],
    image: "https://hatscripts.github.io/circle-flags/flags/ph.svg",
  },
];

export const dataSVG: SVGBarData[] = [
  {
    id: "aapl",
    key: "Apple Inc",
    value: 58.3,
    color: "bg-pink-300 dark:bg-pink-400",
    image: companyLogos[0],
  },
  {
    id: "msft",
    key: "Microsoft",
    value: 42.7,
    color: "bg-purple-300 dark:bg-purple-400",
    image: companyLogos[1],
  },
  {
    id: "amzn",
    key: "Amazon",
    value: 31.5,
    color: "bg-indigo-300 dark:bg-indigo-400",
    image: companyLogos[2],
  },
  {
    id: "googl",
    key: "Google",
    value: 22.5,
    color: "bg-sky-300 dark:bg-sky-400",
    image: companyLogos[3],
  },
  {
    id: "meta",
    key: "Meta",
    value: 18.7,
    color: "bg-orange-300 dark:bg-orange-400",
    image: companyLogos[4],
  },
];

export const dataImage: ImageBarData[] = [
  {
    id: "pt",
    key: "Portugal",
    value: 55.8,
    image: "https://hatscripts.github.io/circle-flags/flags/pt.svg",
    color: "bg-gray-300 dark:bg-zinc-700",
  },
  {
    id: "fr",
    key: "France",
    value: 34.3,
    image: "https://hatscripts.github.io/circle-flags/flags/fr.svg",
    color: "bg-gray-300 dark:bg-zinc-700",
  },
  {
    id: "se",
    key: "Sweden",
    value: 27.1,
    image: "https://hatscripts.github.io/circle-flags/flags/se.svg",
    color: "bg-gray-300 dark:bg-zinc-700",
  },
  {
    id: "es",
    key: "Spain",
    value: 22.5,
    image: "https://hatscripts.github.io/circle-flags/flags/es.svg",
    color: "bg-gray-300 dark:bg-zinc-700",
  },
  {
    id: "it",
    key: "Italy",
    value: 18.7,
    image: "https://hatscripts.github.io/circle-flags/flags/it.svg",
    color: "bg-gray-300 dark:bg-zinc-700",
  },
  {
    id: "de",
    key: "Germany",
    value: 10.8,
    image: "https://hatscripts.github.io/circle-flags/flags/de.svg",
    color: "bg-gray-300 dark:bg-zinc-700",
  },
];

export const dataThin: HorizontalBarData[] = [
  { id: "fr", key: "France", value: 38.1 },
  { id: "es", key: "Spain", value: 25.3 },
  { id: "it", key: "Italy", value: 23.1 },
  { id: "jp", key: "Japan", value: 31.2 },
  { id: "de", key: "Germany", value: 14.7 },
  { id: "nl", key: "Netherlands", value: 6.1 },
  { id: "be", key: "Belgium", value: 10.8 },
  { id: "ca", key: "Canada", value: 19.5 },
  { id: "gr", key: "Greece", value: 6.8 },
  { id: "ch", key: "Switzerland", value: 9.3 },
  { id: "cy", key: "Cyprus", value: 4.8 },
  { id: "br", key: "Brazil", value: 17.3 },
  { id: "si", key: "Slovenia", value: 3.8 },
  { id: "au", key: "Australia", value: 16.4 },
  { id: "lv", key: "Latvia", value: 15.8 },
  { id: "kr", key: "South Korea", value: 20.9 },
  { id: "hr", key: "Croatia", value: 5.8 },
].toSorted((a, b) => b.value - a.value);

export const barVertical: VerticalBarData[] = [
  { id: "software", key: "Software", value: 34.7 },
  { id: "energy", key: "Energy", value: 17.2 },
  { id: "renewable", key: "Renewable", value: 39.0 },
  { id: "consumer", key: "Consumer", value: 48.0 },
  { id: "staples", key: "Staples", value: 15.2 },
  { id: "financial", key: "Financial", value: 31.7 },
  { id: "healthcare", key: "Healthcare", value: 21.4 },
  { id: "property", key: "Property", value: 7.0 },
  { id: "entertainment", key: "Entertainment", value: 44.6 },
  { id: "commodities", key: "Commodities", value: 15.2 },
  { id: "misc", key: "Miscellaneous", value: 29.6 },
  { id: "seasonal", key: "Seasonal", value: 23.6 },
  { id: "personal", key: "Personal", value: 35.6 },
];

export const barVerticalMulti: VerticalMultiBarData[] = [
  { id: "jan-20", key: "Jan 2020", values: [11.1, 9.5] },
  { id: "feb-20", key: "Feb 2020", values: [18.3, 16.7] },
  { id: "mar-20", key: "Mar 2020", values: [25.1, 19.5] },
  { id: "q2-20", key: "Q2 2020", values: [38.9, 27.3] },
  { id: "may-20", key: "May 2020", values: [31.7, 28.1] },
  { id: "jun-20", key: "Jun 2020", values: [25.8, 20.2] },
  { id: "jul-20", key: "Jul 2020", values: [15.8, 10.2] },
  { id: "aug-20", key: "Aug 2020", values: [24.8, 17.2] },
  { id: "sep-20", key: "Sep 2020", values: [32.5, 23.9] },
  { id: "oct-20", key: "Oct 2020", values: [36.7, 27.1] },
  { id: "nov-20", key: "Nov 2020", values: [34.7, 28.1] },
  { id: "dec-20", key: "Dec 2020", values: [42.7, 33.1] },
  { id: "jan-21", key: "Jan 2021", values: [39.7, 36.1] },
];
