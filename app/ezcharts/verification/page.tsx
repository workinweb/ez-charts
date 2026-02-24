"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { authClient } from "@/lib/(auth)/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only redirect when we're sure the user isn't logged in (not during initial load)
    if (isPending === false && !session) {
      router.replace("/sign-in");
    }
  }, [session, isPending, router]);

  const email = session?.user?.email;
  const emailVerified = !!(session?.user as { emailVerified?: boolean })
    ?.emailVerified;

  if (!session) {
    return null;
  }

  if (emailVerified) {
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
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100">
                  <CheckCircle2 className="size-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[#3D4035]">
                    Email already verified
                  </h1>
                  <p className="mt-1 text-[14px] text-[#3D4035]/60">
                    Your email is verified. You&apos;re all set.
                  </p>
                </div>
                <Button
                  asChild
                  className="rounded-xl bg-[#6C5DD3] text-[14px] font-semibold text-white hover:bg-[#5a4dbf]"
                >
                  <Link href="/ezcharts/user">Go to account</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  async function handleResend() {
    if (!email) return;
    setError(null);
    setLoading(true);
    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/ezcharts/user",
      });
      if (result.error) {
        setError(result.error.message ?? "Failed to send verification email.");
        return;
      }
      setSent(true);
    } catch {
      setError("An unexpected error occurred.");
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
                <Mail className="size-5 text-[#6C5DD3]" />
              </div>
              <div>
                <h1 className="text-[20px] font-semibold text-[#3D4035]">
                  Verify your email
                </h1>
                <p className="mt-1 text-[14px] text-[#3D4035]/60">
                  We&apos;ll send a verification link to {email ?? "your email"}.
                </p>
              </div>
            </div>

            {sent ? (
              <div className="rounded-xl bg-emerald-50 px-4 py-4 text-[14px] text-emerald-800">
                Verification email sent. Check your inbox and click the link to
                verify.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                    {error}
                  </p>
                )}
                <Button
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full rounded-xl bg-[#6C5DD3] text-[14px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Send verification email"
                  )}
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
