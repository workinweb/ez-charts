import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart Examples",
  description:
    "Explore chart types — bar, line, pie, area, donut, scatter. Rosencharts and Shadcn UI.",
};

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
