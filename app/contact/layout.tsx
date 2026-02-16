import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | EZ Charts",
  description: "Questions or support — we're here to help.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
