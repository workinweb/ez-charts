import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="px-6 py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#6C5DD3] via-[#5a4dbf] to-[#4a3da8] p-12 text-center text-white shadow-2xl shadow-[#6C5DD3]/25 lg:p-20">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white opacity-15 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-white opacity-5 blur-[60px]" />
        <div className="absolute right-1/4 top-1/2 size-40 -translate-y-1/2 rounded-full bg-white opacity-5 blur-[40px]" />

        <div className="relative z-10">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/70">
            Your next chart is a chat away
          </p>
          <h2 className="mb-6 text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            What would you create
            <br />
            <span className="text-white/90">if charts were easy?</span>
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-lg font-medium leading-relaxed text-indigo-100">
            No coding. No complex tools. Just describe what you need and watch it
            appear. Free to start—no credit card.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/ezcharts"
              className="group inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-[#6C5DD3] shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl sm:w-auto"
            >
              Start free
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/ezcharts/examples"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-full border-2 border-white/40 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/60 sm:w-auto"
            >
              Explore templates
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/60">
            Join analysts who are already making charts the easy way
          </p>
        </div>
      </div>
    </section>
  );
}
