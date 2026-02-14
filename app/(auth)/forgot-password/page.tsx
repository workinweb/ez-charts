"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/(auth)/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSent(false);

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
      });

      if (result.error) {
        setError(result.error.message ?? "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
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
              Reset password
            </h1>
            <p className="mt-1 text-[14px] text-[#3D4035]/60">
              Enter your email and we&apos;ll send you a link to reset your
              password
            </p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-4 text-[14px] text-emerald-800">
            Check your email. If an account exists for {email}, we&apos;ve sent
            a password reset link.
          </div>
        ) : (
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
                "Send reset link"
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-[13px] text-[#3D4035]/60">
          Remember your password?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#6C5DD3] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
