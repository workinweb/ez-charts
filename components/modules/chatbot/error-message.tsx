"use client";

import Image from "next/image";
import { TypewriterText } from "./typewriter-text";

function getFriendlyErrorMessage(error: Error): string {
  const msg = (error?.message ?? "").toLowerCase();

  if (
    msg.includes("429") ||
    msg.includes("rate limit") ||
    msg.includes("too many requests")
  ) {
    return "Oh, it looks like we've hit our usage limit for the moment. No worries though — take a breather and try again a bit later. I'll be right here when you're ready!";
  }

  if (msg.includes("500") || msg.includes("internal server")) {
    return "Hmm, something went wrong on my end. Could you give it another try? If it keeps happening, we might need to look into it together.";
  }

  if (msg.includes("503") || msg.includes("unavailable")) {
    return "I'm feeling a little overloaded at the moment. Give it a minute and try again — I should be back to full speed soon!";
  }

  if (msg.includes("network") || msg.includes("fetch")) {
    return "It seems we lost connection for a moment. Check your internet and try again — I'm happy to pick up where we left off.";
  }

  // Default friendly fallback
  return "Something went wrong on my side. No worries — give it another try and I'll do my best to help!";
}

interface ErrorMessageProps {
  error: Error;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  const text = getFriendlyErrorMessage(error);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={20}
            height={20}
            className="size-5 rounded-full object-cover"
          />
          <span className="text-[13px] font-semibold text-sidebar-foreground">
            Ez Charts
          </span>
        </div>
      </div>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-sidebar-foreground/80">
        <TypewriterText text={text} speed={20} />
      </p>
    </div>
  );
}
