import Link from "next/link";
import { Check, Coffee, Crown, Zap } from "lucide-react";
import { TIER_DOC, type PlanTier } from "@/lib/tiers/tier-limits";

const PRICES: Record<PlanTier, string> = {
  free: "$0",
  pro: "$4.99",
  max: "$9.99",
};

const TIERS: PlanTier[] = ["free", "pro", "max"];
const ICONS = { free: Coffee, pro: Zap, max: Crown } as const;

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 mx-4 mb-4 rounded-[3rem] bg-white py-24 my-20 shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <p className="max-w-sm pb-2 text-sm font-medium leading-relaxed text-slate-500">
            Choose the plan that fits. Free to explore, Pro and Max when you
            need more.
          </p>
          <div className="max-w-xl text-right md:ml-auto">
            <h2 className="text-3xl font-medium uppercase leading-tight tracking-tight text-slate-900 md:text-5xl">
              Pricing plans <br />
              <span className="text-slate-400">
                Start for free and scale as you grow.
              </span>
            </h2>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {TIERS.map((tier) => {
            const Icon = ICONS[tier];
            const doc = TIER_DOC[tier];
            const price = PRICES[tier];
            const isPro = tier === "pro";

            const bullets = doc.bullets;

            return (
              <div
                key={tier}
                className={`relative flex flex-col rounded-[2.5rem] p-8 transition-all duration-300 ${
                  isPro
                    ? "bg-[#6C5DD3] text-white shadow-2xl hover:-translate-y-2"
                    : "border border-transparent bg-[#F8FAFC] hover:border-slate-100 hover:bg-white hover:shadow-xl"
                }`}
              >
                {isPro && (
                  <div className="absolute right-8 top-8 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                    Popular
                  </div>
                )}
                <div
                  className={`mb-6 flex size-12 items-center justify-center rounded-full ${
                    isPro
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <h3
                  className={`mb-2 text-xl font-bold capitalize ${isPro ? "text-white" : "text-slate-900"}`}
                >
                  {tier === "max" ? "Max" : tier}
                </h3>
                <div
                  className={`mb-6 text-4xl font-bold tracking-tight ${isPro ? "text-white" : "text-slate-900"}`}
                >
                  {price}
                  {tier !== "free" && (
                    <span
                      className={`text-base font-normal ${isPro ? "text-white/60" : "text-slate-400"}`}
                    >
                      /mo
                    </span>
                  )}
                </div>
                <p
                  className={`mb-8 text-sm font-medium ${isPro ? "text-white/70" : "text-slate-500"}`}
                >
                  {doc.tagline}
                </p>
                <ul className="mb-8 flex-1 space-y-4">
                  {bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className={`flex items-center gap-3 text-sm font-medium ${
                        isPro ? "text-white/90" : "text-slate-600"
                      }`}
                    >
                      <div
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                          isPro
                            ? "bg-white/20 text-white"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        <Check className="size-3" />
                      </div>
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier === "free" ? "/sign-up" : "/ezcharts"}
                  className={`block w-full rounded-full py-4 text-center text-sm font-bold uppercase tracking-wide transition-colors ${
                    isPro
                      ? "bg-white text-[#6C5DD3] shadow-lg hover:bg-slate-100"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {tier === "free"
                    ? "Start free"
                    : tier === "pro"
                      ? "Get Started"
                      : "Get Max"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
