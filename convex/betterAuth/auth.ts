import { createClient } from "@convex-dev/better-auth";
import type { GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { betterAuth } from "better-auth/minimal";
import authConfig from "../auth.config";

// ─── Better Auth Component Client ───────────────────────────────────────────
// This client has methods needed for integrating Convex with Better Auth,
// as well as helpers for general use (getAuthUser, etc.)
export const authComponent = createClient<DataModel>(components.betterAuth);

// ─── Better Auth Instance Factory ───────────────────────────────────────────
// Creates a fresh auth instance bound to the current Convex context.
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    appName: "Charts AI",
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Flip to true when you add email service
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      // github: {
      //   clientId: process.env.GITHUB_CLIENT_ID!,
      //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // },
    },
    session: {
      // 7-day session, refreshed on each request within the last 24h
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
  });
};
