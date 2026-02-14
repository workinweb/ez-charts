"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/(auth)/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, BarChart3 } from "lucide-react";
import { GoogleIcon } from "@/components/icons/google-icon";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  async function handleResendVerification() {
    setResendSent(false);
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/",
    });
    if (result.error) {
      setError(result.error.message ?? "Failed to send verification email.");
      return;
    }
    setResendSent(true);
    setNeedsVerification(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authClient.signIn.email(
        { email, password },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403 && ctx.error.message?.toLowerCase().includes("verif")) {
              setNeedsVerification(true);
            }
          },
        }
      );

      if (result.error) {
        setError(result.error.message ?? "Sign in failed. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-black/[0.04] sm:rounded-[32px] sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#6C5DD3]/10">
            <BarChart3 className="size-6 text-[#6C5DD3]" />
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-semibold text-[#3D4035]">
              Welcome back
            </h1>
            <p className="mt-1 text-[14px] text-[#3D4035]/60">
              Sign in to your Charts AI account
            </p>
          </div>
        </div>

        {/* Google sign-in */}
        <Button
          type="button"
          variant="outline"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
          className="mb-6 w-full gap-3 rounded-xl border-border/60 text-[14px] font-medium text-[#3D4035] hover:bg-black/[0.02] disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center text-[12px]">
            <span className="bg-white px-3 text-[#3D4035]/40">
              or sign in with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[13px] font-medium text-[#3D4035]/70"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-xl border-border/60 text-[14px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[13px] font-medium text-[#3D4035]/70"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[12px] font-medium text-[#6C5DD3] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
              className="rounded-xl border-border/60 text-[14px]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
              {error}
            </p>
          )}

          {needsVerification && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              Please verify your email to sign in.{" "}
              <button
                type="button"
                onClick={handleResendVerification}
                className="font-semibold underline hover:no-underline"
              >
                Resend verification email
              </button>
              {resendSent && " — Check your inbox."}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="mt-2 w-full rounded-xl bg-[#6C5DD3] text-[14px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#3D4035]/60">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#6C5DD3] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
