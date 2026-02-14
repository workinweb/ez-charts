export interface SlideFixture {
  id: string;
  name: string;
  chartIds: string[];
  type: "custom";
  createdAt: string;
}

/** Pre-built custom slide example — mock data */
export const slidesFixture: SlideFixture[] = [
  {
    id: "custom-1",
    name: "Q4 Overview",
    chartIds: ["1", "3", "5"],
    type: "custom",
    createdAt: "Jan 10",
  },
];
