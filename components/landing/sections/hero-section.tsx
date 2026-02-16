"use client";

import {
  ArrowRight,
  BarChart2,
  Check,
  Download,
  Files,
  LayoutDashboard,
  MessageCircle,
  Palette,
  PlayCircle,
  Settings,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative h-dvh max-h-dvh overflow-hidden bg-[#F2F4F7] pt-40 pb-20 lg:pt-48 lg:pb-32 bg-[radial-gradient(at_10%_10%,hsla(254,70%,90%,1)_0px,transparent_40%),radial-gradient(at_90%_90%,hsla(220,80%,92%,1)_0px,transparent_40%)]">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="mb-8 text-5xl font-medium uppercase leading-[1.1] tracking-tight text-slate-900 lg:text-6xl">
              The perfect blend of <br />
              <span className="text-[#6C5DD3]">AI speed</span>{" "}
              <span className="text-slate-400">&</span>{" "}
              <span className="text-[#6C5DD3]">Control</span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-lg font-medium leading-relaxed text-slate-500 lg:mx-0">
              Generate stunning charts instantly with our AI chatbot, then
              refine with our manual controls, you are in charge. The best of
              both worlds.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/ezcharts"
                className="flex items-center justify-center gap-2 rounded-full bg-[#6C5DD3] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-[#6C5DD3]/30 transition-all hover:-translate-y-1 hover:bg-[#5a4dbf]"
              >
                Chat with Data
                <div className="rounded-full bg-white/20 p-1">
                  <ArrowRight className="size-4" />
                </div>
              </Link>
              <Link
                href="/examples"
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                <PlayCircle className="size-5 text-[#6C5DD3]" />
                View examples
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-slate-500 opacity-80 lg:justify-start">
              <div className="flex items-center gap-2">
                <Check className="size-4 rounded-full bg-slate-200 p-0.5 text-slate-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 rounded-full bg-slate-200 p-0.5 text-slate-600" />
                <span>Export to PNG</span>
              </div>

              <div className="flex items-center gap-2">
                <Check className="size-4 rounded-full bg-slate-200 p-0.5 text-slate-600" />
                <span>Data presentations</span>
              </div>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2">
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-[#C4D2F5] opacity-40 mix-blend-multiply blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-[#9FB4E6] opacity-40 mix-blend-multiply blur-3xl [animation-delay:2s]" />

            <div className="relative z-10 rounded-[3rem] border border-white/60 bg-white/60 p-4 shadow-xl backdrop-blur-sm transition-transform duration-500">
              <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
                <div className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-8">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <BarChart2 className="size-4" />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Revenue Report
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="cursor-pointer rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50">
                      <Share2 className="size-4" />
                    </div>
                    <div className="cursor-pointer rounded-full bg-[#6C5DD3] p-2 text-white shadow-md shadow-indigo-100 transition-colors">
                      <Download className="size-4" />
                    </div>
                  </div>
                </div>

                <div className="flex h-[400px]">
                  <div className="flex w-20 flex-col items-center gap-4 border-r border-slate-100 bg-slate-50/50 py-6">
                    <div className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-white text-[#6C5DD3] shadow-sm">
                      <LayoutDashboard className="size-4" />
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-white hover:text-slate-600 hover:shadow-sm">
                      <Palette className="size-4" />
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-white hover:text-slate-600 hover:shadow-sm">
                      <MessageCircle className="size-4" />
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-white hover:text-slate-600 hover:shadow-sm">
                      <Files className="size-4" />
                    </div>
                    <div className="mt-auto flex size-10 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-white hover:text-slate-600 hover:shadow-sm">
                      <Settings className="size-4" />
                    </div>
                  </div>

                  <div className="relative flex-1 bg-white p-6">
                    <div className="flex h-full flex-col rounded-[2rem] bg-slate-50/50 p-6">
                      <div className="mb-8 flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">
                            Monthly Revenue
                          </h3>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            GROWTH ANALYSIS {new Date().getFullYear()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className="size-2 rounded-full bg-[#6C5DD3]" />
                          <div className="size-2 rounded-full bg-[#9FB4E6]" />
                        </div>
                      </div>

                      <div className="flex flex-1 items-end justify-between gap-4 px-2 pb-2">
                        <div className="h-[40%] w-full rounded-t-2xl bg-[#E0E7FF] transition-all duration-500 hover:bg-[#C7D2FE]" />
                        <div className="h-[55%] w-full rounded-t-2xl bg-[#C7D2FE] transition-all duration-500 hover:bg-[#A5B4FC]" />
                        <div className="h-[45%] w-full rounded-t-2xl bg-[#A5B4FC] transition-all duration-500 hover:bg-[#818CF8]" />
                        <div className="h-[70%] w-full rounded-t-2xl bg-[#818CF8] transition-all duration-500 hover:bg-[#6366F1]" />
                        <div className="h-[60%] w-full rounded-t-2xl bg-[#6366F1] transition-all duration-500 hover:bg-[#4F46E5]" />
                        <div className="group relative h-[85%] w-full rounded-t-2xl bg-[#6C5DD3] shadow-lg shadow-indigo-200 transition-all duration-500 hover:bg-[#5a4dbf]">
                          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-10 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white shadow-xl animate-float-slow">
                            $85k
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-6 w-64 rounded-[1.5rem] border border-white/50 bg-white/90 p-4 shadow-xl backdrop-blur-md animate-float">
                      <div className="mb-3 flex items-start gap-3">
                        <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-white shadow-md">
                          <Image
                            src="/logo.png"
                            alt=""
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="pt-1 text-xs font-medium leading-relaxed text-slate-600">
                          I&apos;ve matched the chart colors to your brand
                          palette. Anything else?
                        </div>
                      </div>
                      <div className="flex gap-2 rounded-full border border-slate-100 bg-slate-50 p-1">
                        <input
                          type="text"
                          placeholder="Reply..."
                          className="flex-1 bg-transparent px-3 py-1 text-xs focus:outline-none"
                          readOnly
                        />
                        <button className="flex size-7 items-center justify-center rounded-full bg-[#6C5DD3] text-white transition-colors hover:bg-[#5a4dbf]">
                          <ArrowRight className="size-3 rotate-[-90deg]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
