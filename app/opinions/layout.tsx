import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opinions & Feedback",
  description: "Share your feedback and upvote others' ideas for EZ Charts.",
};

export default function OpinionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
