"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/(auth)/auth-client";
import { Button } from "@/components/ui/button";
import { KeyRound, Shield } from "lucide-react";

export function SecuritySection({
  email,
  emailVerified,
}: {
  email: string;
  emailVerified: boolean;
}) {
  const [hasCredentialAccount, setHasCredentialAccount] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    authClient
      .listAccounts()
      .then((result: unknown) => {
        const accounts = Array.isArray(result) ? result : (result as { data?: Array<{ providerId?: string }> })?.data ?? [];
        const hasCredential = accounts.some((a) => a.providerId === "credential");
        setHasCredentialAccount(hasCredential);
      })
      .catch(() => setHasCredentialAccount(false));
  }, []);

  if (hasCredentialAccount === null) {
    return (
      <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100">
            <Shield className="size-5 animate-pulse text-amber-600" />
          </div>
          <p className="text-[14px] text-[#3D4035]/60">Loading…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100">
          <Shield className="size-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-[#3D4035]">
            Security & password
          </h2>
          <p className="mt-1 text-[13px] text-[#3D4035]/50">
            Manage your password and email verification
          </p>
        </div>
      </div>

      {!emailVerified && (
        <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3">
          <p className="text-[14px] text-amber-800">
            Your email is not verified yet.{" "}
            <Link
              href="/ezcharts/verification"
              className="font-semibold text-[#6C5DD3] hover:underline"
            >
              Verify now
            </Link>
          </p>
        </div>
      )}

      <div className="mt-6 border-t border-[#3D4035]/8 pt-5">
        {hasCredentialAccount ? (
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-[#3D4035]/60" />
              <h3 className="text-[15px] font-medium text-[#3D4035]">
                Change password
              </h3>
            </div>
            <p className="mt-2 text-[13px] text-[#3D4035]/60">
              Update your password to keep your account secure.
            </p>
            <Link href="/ezcharts/user/change-password" className="mt-4 inline-flex">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-[#3D4035]/25 text-[14px] font-semibold text-[#3D4035] hover:bg-[#3D4035]/5"
              >
                Change password
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-[#3D4035]/60" />
              <h3 className="text-[15px] font-medium text-[#3D4035]">
                Add a password
              </h3>
            </div>
            <p className="mt-2 text-[13px] text-[#3D4035]/60">
              You signed in with Google. Add a password to sign in with email
              anytime.
            </p>
            <Link href="/ezcharts/user/set-password" className="mt-4 inline-flex">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-[#3D4035]/25 text-[14px] font-semibold text-[#3D4035] hover:bg-[#3D4035]/5"
              >
                Set password
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
