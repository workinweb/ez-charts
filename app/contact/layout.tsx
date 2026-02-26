import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions or support — we're here to help. Get in touch with the EZ Charts team.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
