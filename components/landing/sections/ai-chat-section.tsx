import Image from "next/image";
import { MessageSquare, RefreshCw, Palette } from "lucide-react";

export function AIChatSection() {
  return (
    <section className="overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-20 lg:flex-row">
          <div className="relative lg:w-1/2">
            <div className="absolute inset-0 rounded-full bg-[#6C5DD3] opacity-10 blur-[120px]" />
            <div className="relative rounded-[3rem] border border-white bg-[#F8FAFC] p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-[2rem] rounded-tr-sm bg-white px-6 py-4 text-slate-800 shadow-sm">
                    <p className="text-sm font-medium">
                      Can you change this to a donut chart and highlight
                      &quot;Enterprise&quot; in purple?
                    </p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="flex max-w-[95%] gap-4">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-lg">
                      <Image src="/logo.png" alt="" fill className="object-contain p-1.5" />
                    </div>
                    <div className="w-full space-y-4">
                      <div className="rounded-[2rem] rounded-tl-sm border border-slate-100 bg-white p-6 shadow-sm">
                        <p className="mb-6 text-sm font-medium text-slate-600">
                          Done! I&apos;ve converted the visualization and
                          applied the highlight color.
                        </p>
                        <div className="flex items-center justify-center rounded-[1.5rem] bg-[#F1F5F9] p-8">
                          <div className="relative size-40 rounded-full border-[16px] border-white border-t-[#6C5DD3] border-r-[#6C5DD3] -rotate-45 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="mb-6 inline-block rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Interaction
            </div>
            <h2 className="mb-6 text-4xl font-medium uppercase leading-tight tracking-tight text-slate-900">
              Describe the chart. <br />
              <span className="text-[#6C5DD3]">Get it in seconds.</span>
            </h2>
            <p className="mb-10 text-lg font-medium leading-relaxed text-slate-500">
              Paste data or upload a file. Ask for a bar chart, donut, scatter,
              or any type—the AI creates it and refines it on request.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#6C5DD3] shadow-sm">
                  <MessageSquare className="size-5" />
                </div>
                <span className="font-semibold text-slate-700">
                  Create charts from plain English
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#6C5DD3] shadow-sm">
                  <RefreshCw className="size-5" />
                </div>
                <span className="font-semibold text-slate-700">
                  Swap chart types in one message
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#6C5DD3] shadow-sm">
                  <Palette className="size-5" />
                </div>
                <span className="font-semibold text-slate-700">
                  Refine colors and highlights on request
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
