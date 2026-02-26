import { fetchAuthQuery, fetchAuthMutation } from "@/lib/(auth)/auth-server";
import { api } from "@/convex/_generated/api";
import { AppLayoutClient } from "@/components/layout/app-layout-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Create and manage your AI-powered charts. Chat with data, edit manually, export to PNG.",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialSettings: { dashboardCardOrder?: string[]; saveDocumentsOnDb?: boolean } | null = null;
  try {
    let settings = await fetchAuthQuery(api.userSettings.get);
    if (!settings) {
      await fetchAuthMutation(api.userSettings.ensure);
      settings = await fetchAuthQuery(api.userSettings.get);
    }
    initialSettings = settings;
  } catch {
    // Not authenticated or query failed — use defaults
  }

  return <AppLayoutClient initialSettings={initialSettings}>{children}</AppLayoutClient>;
}
