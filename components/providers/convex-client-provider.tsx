"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ConvexClientProviderProps {
  children: ReactNode;
  initialToken?: string | null;
}

/**
 * Provides the Convex client (with Better Auth session management) to the
 * entire app. Replaces the default ConvexProvider to include auth tokens.
 */
export function ConvexClientProvider({
  children,
  initialToken,
}: ConvexClientProviderProps) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
