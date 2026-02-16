import { Bot, Settings2, Files } from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 bg-[#F2F4F7] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6C5DD3]">
              Features
            </div>
            <h2 className="text-3xl font-medium uppercase leading-tight tracking-tight text-slate-900 md:text-5xl">
              Workflow that <br />
              <span className="text-slate-400">adapts to you</span>
            </h2>
          </div>
          <p className="max-w-sm pb-2 text-sm font-medium leading-relaxed text-slate-500">
            Whether you prefer talking to an AI or editing data and colors
            yourself, EZ Charts has the tools you need.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="group rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div className="mb-8 flex items-start justify-between">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#F0F4FF] transition-colors duration-300 group-hover:bg-[#6C5DD3]">
                <Bot className="size-6 text-[#6C5DD3] transition-colors group-hover:text-white" />
              </div>
              <span className="rounded-full border border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400">
                01
              </span>
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">AI Copilot</h3>
            <p className="mb-8 text-sm leading-relaxed text-slate-500">
              Ask in plain English: &quot;Make a bar chart of quarterly revenue&quot; or
              &quot;Turn this into a donut and highlight Enterprise&quot;. The AI creates
              and refines charts on the fly.
            </p>
            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
              <span className="mr-2 inline-block size-2 rounded-full bg-[#6C5DD3]" />
              Turn this into a donut and highlight &quot;Enterprise&quot; in purple.
            </div>
          </div>

          <div className="group rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div className="mb-8 flex items-start justify-between">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#FDF2F8] transition-colors duration-300 group-hover:bg-rose-500">
                <Settings2 className="size-6 text-rose-500 transition-colors group-hover:text-white" />
              </div>
              <span className="rounded-full border border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400">
                02
              </span>
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">
              Manual Studio
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-slate-500">
              Edit data in a spreadsheet or expandable cards. Tweak colors per
              slice or series. Toggle tooltips and animations—no code required.
            </p>
            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
              <span className="mr-2 inline-block size-2 rounded-full bg-rose-500" />
              Data · Colors · Settings
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2.5rem] bg-[#6C5DD3] p-8 text-white shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute -right-4 -top-4 size-32 rounded-full bg-white opacity-10 blur-2xl" />
            <div className="relative z-10 mb-8 flex items-start justify-between">
              <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 group-hover:bg-white group-hover:text-[#6C5DD3]">
                <Files className="size-6 text-white transition-colors group-hover:text-[#6C5DD3]" />
              </div>
              <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] font-bold text-white/60">
                03
              </span>
            </div>
            <h3 className="relative z-10 mb-3 text-xl font-bold text-white">
              Data Agnostic
            </h3>
            <p className="relative z-10 mb-8 text-sm leading-relaxed text-indigo-100">
              Paste data in chat or upload CSV, Excel, PDF, or JSON. The AI
              parses it and suggests the right chart—no schema wrestling.
            </p>
            <div className="relative z-10 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white backdrop-blur-md">
                CSV
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white backdrop-blur-md">
                Excel
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white backdrop-blur-md">
                PDF
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white backdrop-blur-md">
                JSON
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
