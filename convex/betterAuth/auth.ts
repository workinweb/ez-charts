import type { GenericCtx } from "@convex-dev/better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import { authEmailBody, sendEmail } from "./sendEmail";

// ─── Better Auth Component Client ───────────────────────────────────────────
// This client has methods needed for integrating Convex with Better Auth,
// as well as helpers for general use (getAuthUser, etc.)
export const authComponent = createClient<DataModel>(components.betterAuth);

// ─── Better Auth Instance Factory ───────────────────────────────────────────
// Creates a fresh auth instance bound to the current Convex context.
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    appName: "Ez2Chart",
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    trustedOrigins: [process.env.SITE_URL ?? ""],

    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Verify your email – Ez2Chart",
          text: `Click the link below to verify your email:\n\n${url}\n\nIf you didn't sign up, you can ignore this email.`,
          html: authEmailBody({
            title: "Verify your email",
            body: "Click the button below to verify your email address for Ez2Chart.",
            buttonText: "Verify email",
            url,
          }),
        });
      },
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set true to block login until verified
      sendResetPassword: async ({ user, url }) => {
        // Only called when user has a credential account (signed up with email/password).
        // Better Auth does NOT call this for OAuth-only users (e.g. Google-only) - they
        // have no password to reset. Use "Set password via email" on user page instead.
        await sendEmail({
          to: user.email,
          subject: "Reset your password – Ez2Chart",
          text: `Click the link below to reset your password:\n\n${url}\n\nIf you didn't request this, you can ignore this email. The link expires in 1 hour.`,
          html: authEmailBody({
            title: "Reset your password",
            body: "Click the button below to reset your password. The link expires in 1 hour.",
            buttonText: "Reset password",
            url,
          }),
        });
      },
    },

    socialProviders: {
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              mapProfileToUser: (profile) => ({
                image: profile.picture,
                name: profile.name,
              }),
            },
          }
        : {}),
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
