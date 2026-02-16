import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart Examples | EZ Charts",
  description:
    "Explore all chart types — Rosencharts and Shadcn. Bar, line, pie, area, donut, scatter, and more.",
};

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
