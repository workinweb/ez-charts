"use client";

import { motion } from "motion/react";

const SHOUT_OUTS = [
  {
    name: "shadcn/ui",
    href: "https://ui.shadcn.com",
    description: "Beautiful, accessible components for the web.",
  },
  {
    name: "Rosencharts",
    href: "https://www.rosencharts.com",
    description: "React charts built on D3 — copy-paste, customizable.",
  },
] as const;

export function ShoutOutCards() {
  return (
    <section className="rounded-2xl border-2 border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 to-slate-50/80 p-6 sm:p-8 ring-1 ring-indigo-100/50">
      <div className="mb-3 inline-block rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6C5DD3]">
        Shout outs
      </div>
      <h2 className="mb-2 text-lg font-semibold text-slate-900">
        Built on great open-source
      </h2>
      <p className="mb-6 text-[15px] leading-relaxed text-slate-600">
        Ez2Chart wouldn&apos;t be possible without these chart libraries.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {SHOUT_OUTS.map((item, i) => (
          <motion.a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:border-indigo-200/80"
          >
            <span className="font-semibold text-[#6C5DD3] group-hover:underline">
              {item.name}
            </span>
            <span className="text-[14px] leading-relaxed text-slate-600">
              {item.description}
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
