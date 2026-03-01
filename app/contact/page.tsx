"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send. Please try again.");
    }
  }

  return (
    <div className="flex min-h-dvh min-h-screen items-center justify-center overflow-y-auto bg-gradient-to-br from-[#F5F3FF] via-white to-[#EDE9FE] p-4 py-6 sm:p-8">
      <div className="w-full max-w-[480px] sm:max-w-[540px]">
        <Link
          href="/"
          className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-[#3D4035]/60 transition-colors hover:text-[#3D4035]"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
        <div className="rounded-[24px] bg-white p-5 shadow-lg shadow-black/5 ring-1 ring-black/[0.04] sm:rounded-[28px] sm:p-8">
          <div className="mb-4 flex flex-col items-center gap-2 sm:mb-5 sm:gap-3">
            <div className="relative size-12 shrink-0 sm:size-[60px]">
              <Image
                src="/logo.png"
                alt="Ez2Chart"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-center">
              <h1 className="text-[20px] font-semibold text-[#3D4035] sm:text-[24px]">
                Contact us
              </h1>
              <p className="mt-0.5 text-[14px] text-[#3D4035]/60 sm:mt-1 sm:text-[15px]">
                Questions or support — we&apos;re here to help.
              </p>
            </div>
          </div>

          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <MessageCircle className="size-7" />
              </div>
              <h2 className="text-xl font-semibold text-[#3D4035]">
                Message sent
              </h2>
              <p className="text-[15px] text-[#3D4035]/60">
                Thanks for reaching out. We&apos;ll get back to you soon.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatus("idle")}
                className="mt-1 h-11 rounded-xl border-[#E0E0E0] text-[15px] font-medium text-[#3D4035]"
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-3">
              <div className="flex flex-col gap-1.5">
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
                  className="h-10 rounded-xl border-[#E0E0E0] text-[14px] sm:h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
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
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="subject"
                  className="text-[13px] font-medium text-[#3D4035]/80"
                >
                  Subject
                </label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="How can we help?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="h-10 rounded-xl border-[#E0E0E0] text-[14px] sm:h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="message"
                  className="text-[13px] font-medium text-[#3D4035]/80"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Your question or support request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={3}
                  className="min-h-[72px] rounded-xl border-[#E0E0E0] text-[14px] sm:min-h-[88px]"
                />
              </div>

              {errorMessage && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                disabled={status === "loading"}
                className="mt-0.5 h-10 rounded-xl bg-[#6C5DD3] py-4 text-[14px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50 sm:h-11"
              >
                {status === "loading" ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Send message"
                )}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-[13px] text-[#3D4035]/60 sm:mt-5 sm:text-[14px]">
            Back to{" "}
            <Link
              href="/"
              className="font-semibold text-[#6C5DD3] hover:underline"
            >
              home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
