"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/(auth)/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (errorParam === "INVALID_TOKEN" || !token) {
    return (
      <div className="w-full max-w-[400px]">
        <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-black/[0.04] sm:rounded-[32px] sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-red-100">
              <BarChart3 className="size-6 text-red-600" />
            </div>
            <div className="text-center">
              <h1 className="text-[22px] font-semibold text-[#3D4035]">
                Invalid or expired link
              </h1>
              <p className="mt-1 text-[14px] text-[#3D4035]/60">
                This password reset link is invalid or has expired. Request a new
                one.
              </p>
            </div>
          </div>
          <Link href="/forgot-password">
            <Button className="w-full rounded-xl bg-[#6C5DD3] text-[14px] font-semibold text-white hover:bg-[#5a4dbf]">
              Request new link
            </Button>
          </Link>
          <p className="mt-6 text-center text-[13px] text-[#3D4035]/60">
            <Link href="/sign-in" className="font-semibold text-[#6C5DD3] hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token: token ?? undefined,
      });

      if (result.error) {
        setError(result.error.message ?? "Failed to reset password. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-[400px]">
        <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-black/[0.04] sm:rounded-[32px] sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100">
              <BarChart3 className="size-6 text-emerald-600" />
            </div>
            <div className="text-center">
              <h1 className="text-[22px] font-semibold text-[#3D4035]">
                Password reset
              </h1>
              <p className="mt-1 text-[14px] text-[#3D4035]/60">
                Your password has been updated. You can now sign in.
              </p>
            </div>
          </div>
          <Link href="/sign-in">
            <Button className="w-full rounded-xl bg-[#6C5DD3] text-[14px] font-semibold text-white hover:bg-[#5a4dbf]">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    );
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
              Set new password
            </h1>
            <p className="mt-1 text-[14px] text-[#3D4035]/60">
              Enter your new password below
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[13px] font-medium text-[#3D4035]/70"
            >
              New password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              className="rounded-xl border-border/60 text-[14px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirm-password"
              className="text-[13px] font-medium text-[#3D4035]/70"
            >
              Confirm password
            </label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              className="rounded-xl border-border/60 text-[14px]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-[#6C5DD3] text-[14px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Reset password"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#3D4035]/60">
          <Link href="/sign-in" className="font-semibold text-[#6C5DD3] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[28px] bg-white/80" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
