import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions or support — we're here to help. Get in touch with the Ez2Chart team.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
