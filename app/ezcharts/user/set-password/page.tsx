"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message ?? "Failed to set password. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/ezcharts/user"), 1500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6 pt-6">
          <Link
            href="/ezcharts/user"
            className="inline-flex w-fit items-center gap-2 text-[14px] font-medium text-[#3D4035]/60 hover:text-[#3D4035]"
          >
            <ArrowLeft className="size-4" />
            Back to account
          </Link>

          <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#6C5DD3]/20">
                <KeyRound className="size-5 text-[#6C5DD3]" />
              </div>
              <div>
                <h1 className="text-[20px] font-semibold text-[#3D4035]">
                  Set a password
                </h1>
                <p className="mt-1 text-[14px] text-[#3D4035]/60">
                  Add a password so you can sign in with email anytime.
                </p>
              </div>
            </div>

            {success ? (
              <div className="rounded-xl bg-emerald-50 px-4 py-4 text-[14px] text-emerald-800">
                Password set successfully. Redirecting to your account…
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="text-[13px] font-medium text-[#3D4035]/70"
                  >
                    New password
                  </label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="mt-1.5 rounded-xl border-border/60 text-[14px]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="text-[13px] font-medium text-[#3D4035]/70"
                  >
                    Confirm password
                  </label>
                  <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Repeat your password"
                    className="mt-1.5 rounded-xl border-border/60 text-[14px]"
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
                    "Set password"
                  )}
                </Button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
