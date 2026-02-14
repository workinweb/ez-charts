import { createClient } from "@convex-dev/better-auth";
import type { GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { betterAuth } from "better-auth/minimal";
import authConfig from "../auth.config";
import { sendEmail } from "./sendEmail";

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
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        void sendEmail({
          to: user.email,
          subject: "Verify your email – Charts AI",
          text: `Click the link below to verify your email:\n\n${url}\n\nIf you didn't sign up, you can ignore this email.`,
        });
      },
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set true to block login until verified
      sendResetPassword: async ({ user, url }) => {
        void sendEmail({
          to: user.email,
          subject: "Reset your password – Charts AI",
          text: `Click the link below to reset your password:\n\n${url}\n\nIf you didn't request this, you can ignore this email. The link expires in 1 hour.`,
        });
      },
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
