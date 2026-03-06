"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import { PROMPT_EXAMPLES } from "@/lib/prompt-examples";

export function PromptExamplesSection() {
  return (
    <section
      id="prompt-examples"
      className="scroll-mt-20 bg-[#F2F4F7] py-24 pb-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6C5DD3]">
              How to use it
            </div>
            <h2 className="text-3xl font-medium uppercase leading-tight tracking-tight text-slate-900 md:text-5xl">
              Example prompts
            </h2>
          </div>
          <p className="max-w-md text-sm font-medium leading-relaxed text-slate-500">
            Try these in the chat to see what the AI can do—create charts from
            data, refine visuals, or analyze uploaded files.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMPT_EXAMPLES.map((prompt, i) => (
            <div
              key={i}
              className="group flex items-start gap-4 rounded-[2rem] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0F4FF] text-[#6C5DD3] transition-colors duration-300 group-hover:bg-[#6C5DD3] group-hover:text-white">
                <MessageSquare className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-relaxed text-slate-700">
                  &quot;{prompt}&quot;
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/ezcharts"
            className="inline-flex items-center gap-2 rounded-full bg-[#6C5DD3] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6C5DD3]/25 transition-all hover:bg-[#5a4dbf] hover:-translate-y-0.5"
          >
            Try in the chat
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
