import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-client-provider";
import { PostHogProvider } from "@/providers/posthog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getToken } from "@/lib/(auth)/auth-server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EZ Charts",
  description: "AI-powered charts from your input or file data",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <PostHogProvider>
          <ConvexClientProvider initialToken={token}>
            <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
          </ConvexClientProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
