import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function TemplatesSection() {
  return (
    <section id="templates" className="scroll-mt-20 bg-[#F2F4F7] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-medium uppercase tracking-tight text-slate-900">
              Start with a template
            </h2>
            <p className="font-medium text-slate-500">
              Jumpstart your project with pre-made designs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/ezcharts/edit" className="group cursor-pointer">
            <div className="relative h-56 overflow-hidden rounded-[2rem] bg-white p-2 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="flex h-full w-full items-end justify-center overflow-hidden rounded-[1.5rem] bg-slate-50 px-8 pb-8">
                <div className="flex h-32 w-full items-end gap-2">
                  <div className="h-[40%] w-full rounded-t-lg bg-[#E0E7FF] transition-colors group-hover:bg-[#6C5DD3]" />
                  <div className="h-[70%] w-full rounded-t-lg bg-[#C7D2FE] opacity-80 transition-colors group-hover:bg-[#6C5DD3]" />
                  <div className="h-[50%] w-full rounded-t-lg bg-[#A5B4FC] opacity-60 transition-colors group-hover:bg-[#6C5DD3]" />
                </div>
              </div>
              <div className="absolute right-4 top-4 scale-90 rounded-full bg-white p-2 opacity-0 shadow-sm transition-all group-hover:scale-100 group-hover:opacity-100">
                <ArrowRight className="size-4 rotate-[-45deg] text-slate-900" />
              </div>
            </div>
            <div className="mt-4 px-2">
              <h4 className="text-lg font-bold text-slate-900">Comparison</h4>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Bar Chart
              </p>
            </div>
          </Link>

          <Link href="/ezcharts/edit" className="group cursor-pointer">
            <div className="relative h-56 overflow-hidden rounded-[2rem] bg-white p-2 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-slate-50">
                <div className="size-24 rounded-full border-[16px] border-[#E2E8F0] border-t-[#6C5DD3] transition-transform duration-500 group-hover:rotate-90" />
              </div>
            </div>
            <div className="mt-4 px-2">
              <h4 className="text-lg font-bold text-slate-900">Distribution</h4>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Donut Chart
              </p>
            </div>
          </Link>

          <Link href="/ezcharts/edit" className="group cursor-pointer">
            <div className="relative h-56 overflow-hidden rounded-[2rem] bg-white p-2 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="flex h-full w-full items-end overflow-hidden rounded-[1.5rem] bg-slate-50">
                <svg
                  className="h-full w-full"
                  viewBox="0 0 100 50"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 50 Q 25 20 50 35 T 100 25"
                    fill="none"
                    stroke="#6C5DD3"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 50 L 0 50 Q 25 20 50 35 T 100 25 L 100 50 Z"
                    fill="#6C5DD3"
                    opacity="0.1"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4 px-2">
              <h4 className="text-lg font-bold text-slate-900">Trends</h4>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Area Chart
              </p>
            </div>
          </Link>

          <Link href="/ezcharts/edit" className="group cursor-pointer">
            <div className="relative h-56 overflow-hidden rounded-[2rem] bg-white p-2 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="flex h-full w-full items-center justify-center gap-2 overflow-hidden rounded-[1.5rem] bg-slate-50">
                <div className="size-2 rounded-full bg-slate-300" />
                <div className="mb-8 size-3 rounded-full bg-slate-300" />
                <div className="mt-4 size-2 rounded-full bg-slate-300" />
                <div className="-mt-8 flex size-6 items-center justify-center rounded-full bg-[#6C5DD3] text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-125">
                  <span className="text-xs font-bold">+</span>
                </div>
              </div>
            </div>
            <div className="mt-4 px-2">
              <h4 className="text-lg font-bold text-slate-900">Correlation</h4>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Scatter Plot
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
