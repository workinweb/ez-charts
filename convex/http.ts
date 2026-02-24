import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "./_generated/dataModel";
import { httpActionGeneric, httpRouter } from "convex/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

// Set password for OAuth-only users. Must be HTTP (not Convex action) because
// the Better Auth Convex plugin expects ctx.path from a real request.
http.route({
  path: "/api/set-password",
  method: "POST",
  handler: httpActionGeneric(async (ctx, request) => {
    const body = (await request.json().catch(() => ({}))) as { newPassword?: unknown };
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!newPassword || newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: { message: "Password must be at least 8 characters." } }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const auth = createAuth(ctx as unknown as GenericCtx<DataModel>);
    try {
      await auth.api.setPassword({
        body: { newPassword },
        headers: request.headers,
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to set password.";
      return new Response(
        JSON.stringify({ error: { message } }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }),
});

authComponent.registerRoutes(http, createAuth);

export default http;
