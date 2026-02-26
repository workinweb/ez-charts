import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "./_generated/dataModel";
import { httpActionGeneric, httpRouter } from "convex/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

// ─── Stripe Webhook ───────────────────────────────────────────────────────
// Handles subscription lifecycle events and syncs to our DB + userSettings.
http.route({
  path: "/api/stripe-webhook",
  method: "POST",
  handler: httpActionGeneric(async (ctx, request) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      console.error("STRIPE_WEBHOOK_SECRET not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const rawBody = await request.text();
    const sig = request.headers.get("stripe-signature");
    if (!sig) {
      return new Response("Missing stripe-signature", { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    let event: Stripe.Event;
    try {
      event = (await stripe.webhooks.constructEventAsync(
        rawBody,
        sig,
        secret,
      )) as Stripe.Event;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
      console.error("Stripe webhook error:", msg);
      return new Response(msg, { status: 400 });
    }
    const processSub = async (
      sub: Stripe.Subscription,
      userIdOverride?: string,
    ) => {
      const userId =
        userIdOverride ??
        (sub.metadata?.userId as string | undefined) ??
        (typeof sub.customer === "string"
          ? undefined
          : (sub.customer as Stripe.Customer)?.metadata?.userId);

      const item = sub.items.data[0];
      const priceId = item?.price?.id ?? "";
      if (!userId && sub.status !== "canceled") {
        console.error(
          "[Stripe webhook] No userId found for subscription",
          sub.id,
          "metadata:",
          sub.metadata,
          "session override:",
          userIdOverride,
        );
        return;
      }

      const subObj = sub as Stripe.Subscription;
      console.log("[Stripe webhook] Processing subscription", sub.id, "userId:", userId ?? "(lookup)", "status:", subObj.status);
      await ctx.runMutation(internal.stripe.stripe.processSubscriptionEvent, {
        userId: userId || undefined,
        stripeCustomerId:
          typeof subObj.customer === "string" ? subObj.customer : subObj.customer?.id,
        stripeSubscriptionId: subObj.id,
        stripePriceId: priceId,
        plan: subObj.metadata?.plan ?? "pro",
        status: subObj.status,
        currentPeriodStart: (subObj as { current_period_start?: number }).current_period_start! * 1000,
        currentPeriodEnd: (subObj as { current_period_end?: number }).current_period_end! * 1000,
        cancelAtPeriodEnd: subObj.cancel_at_period_end,
        trialStart: subObj.trial_start ? subObj.trial_start * 1000 : undefined,
        trialEnd: subObj.trial_end ? subObj.trial_end * 1000 : undefined,
      });
    };

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode === "subscription" && session.subscription) {
            const sub = await stripe.subscriptions.retrieve(
              session.subscription as string,
              { expand: ["customer"] },
            );
            await processSub(sub, session.metadata?.userId as string | undefined);
          }
          // One-time credit purchase — session has metadata + payment_intent for idempotency
          if (session.mode === "payment" && session.payment_status === "paid") {
            const userId = session.metadata?.userId as string | undefined;
            const creditsStr = session.metadata?.credits as string | undefined;
            const credits = creditsStr ? parseInt(creditsStr, 10) : NaN;
            const paymentIntentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent as Stripe.PaymentIntent)?.id;
            if (userId && !isNaN(credits) && credits > 0 && paymentIntentId) {
              await ctx.runMutation(
                internal.stripe.stripe.addCreditsFromPaymentIntent,
                {
                  userId,
                  credits,
                  paymentIntentId,
                  amountCents: session.amount_total ?? undefined,
                  currency: session.currency ?? undefined,
                },
              );
            }
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          await processSub(sub);
          break;
        }
        case "invoice.paid": {
          // Subscription payment succeeded — this often fires after checkout.session.completed
          // when the subscription was initially "incomplete". Grant access here.
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
          const subId = invoice.subscription;
          if (subId) {
            const sub = await stripe.subscriptions.retrieve(
              typeof subId === "string" ? subId : (subId as { id: string }).id,
            );
            await processSub(sub);
          }
          break;
        }
        case "invoice.payment_failed": {
          // Payment failed — fetch subscription (now past_due/unpaid) and restrict access
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
          const subId = invoice.subscription;
          if (subId) {
            const sub = await stripe.subscriptions.retrieve(
              typeof subId === "string" ? subId : (subId as { id: string }).id,
            );
            await processSub(sub);
          }
          break;
        }
        case "payment_intent.succeeded": {
          // One-time credit purchase — add credits to user
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const userId = paymentIntent.metadata?.userId as string | undefined;
          const creditsStr = paymentIntent.metadata?.credits as string | undefined;
          const credits = creditsStr ? parseInt(creditsStr, 10) : NaN;
          if (userId && !isNaN(credits) && credits > 0) {
            await ctx.runMutation(
              internal.stripe.stripe.addCreditsFromPaymentIntent,
              {
                userId,
                credits,
                paymentIntentId: paymentIntent.id,
                amountCents: paymentIntent.amount,
                currency: paymentIntent.currency,
              },
            );
          }
          break;
        }
        case "customer.created": {
          // Optional: sync Stripe customer ID. We already get it from
          // checkout/subscription events, so this is mostly for edge cases.
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error("Stripe webhook processing error:", err);
      return new Response("Webhook processing failed", { status: 500 });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

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
