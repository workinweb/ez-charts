"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/(auth)/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/icons/google-icon";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message ?? "Sign up failed. Please try again.");
        return;
      }

      router.push("/ezcharts");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/ezcharts",
      });
    } catch {
      setError("Google sign-up failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-[24px] bg-white p-10 shadow-lg shadow-black/5 ring-1 ring-black/[0.04] sm:rounded-[28px] sm:p-12">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="relative size-[75px] shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-[24px] font-semibold text-[#3D4035]">
              Create your account
            </h1>
            <p className="mt-2 text-[15px] text-[#3D4035]/60">
              Start building charts with AI
            </p>
          </div>
        </div>

        {/* Google sign-up */}
        <Button
          type="button"
          variant="outline"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignUp}
          className="h-12 w-full gap-3 rounded-xl border-[#E0E0E0] bg-white py-6 text-[15px] font-medium text-[#3D4035] hover:bg-[#FAFAFA] disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <GoogleIcon className="size-5" />
          )}
          Google
        </Button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E5E5]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-[11px] font-medium uppercase tracking-wider text-[#3D4035]/50">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-[13px] font-medium text-[#3D4035]/80"
            >
              Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="h-11 rounded-xl border-[#E0E0E0] text-[14px]"
            />
          </div>

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
              className="h-11 rounded-xl border-[#E0E0E0] text-[14px]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[13px] font-medium text-[#3D4035]/80"
            >
              Password
            </label>
            <PasswordInput
              id="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              className="h-11 rounded-xl border-[#E0E0E0] text-[14px]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirm-password"
              className="text-[13px] font-medium text-[#3D4035]/80"
            >
              Confirm password
            </label>
            <PasswordInput
              id="confirm-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              className="h-11 rounded-xl border-[#E0E0E0] text-[14px]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="mt-2 h-12 w-full rounded-xl bg-[#6C5DD3] py-6 text-[15px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-[14px] text-[#3D4035]/60">
          Already have an account?{" "}
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
