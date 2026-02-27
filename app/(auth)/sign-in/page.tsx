"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/(auth)/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import Image from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/icons/google-icon";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/ezcharts";
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
      callbackURL: redirectTo,
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

      router.push(redirectTo);
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
        callbackURL: redirectTo,
      });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <Link
        href="/"
        className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-[#3D4035]/60 transition-colors hover:text-[#3D4035]"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
      <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-black/5 ring-1 ring-black/[0.04] sm:rounded-[28px] sm:p-10">
        <div className="mb-6 flex flex-col items-center gap-3 sm:mb-8 sm:gap-4">
          <div className="relative size-12 shrink-0 sm:size-[60px]">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-semibold text-[#3D4035] sm:text-[24px]">
              Welcome back
            </h1>
            <p className="mt-1 text-[14px] text-[#3D4035]/60 sm:mt-2 sm:text-[15px]">
              Sign in to continue to your dashboard
            </p>
          </div>
        </div>

        {/* Google sign-in */}
        <Button
          type="button"
          variant="outline"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
          className="h-10 w-full gap-2 rounded-xl border-[#E0E0E0] bg-white py-5 text-[14px] font-medium text-[#3D4035] hover:bg-[#FAFAFA] disabled:opacity-50 sm:h-11"
        >
          {googleLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <GoogleIcon className="size-5" />
          )}
          Google
        </Button>

        <div className="relative my-5 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E5E5]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-[11px] font-medium uppercase tracking-wider text-[#3D4035]/50">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[13px] font-medium text-[#3D4035]/80"
            >
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-10 rounded-xl border-[#E0E0E0] text-[14px] sm:h-11"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[13px] font-medium text-[#3D4035]/80"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[13px] font-medium text-[#6C5DD3] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
              className="h-10 rounded-xl border-[#E0E0E0] text-[14px] sm:h-11"
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
            className="mt-1 h-10 w-full rounded-xl bg-[#6C5DD3] py-5 text-[14px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50 sm:h-11"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-[#3D4035]/60 sm:mt-6 sm:text-[14px]">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#6C5DD3] hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
