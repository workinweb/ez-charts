"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMBEDS = [
  {
    src: "https://demo.arcade.software/YeNrCkNDt40v2jTluvSa?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true",
    title: "Mark Charts as Favorites and Add Them to a Slide Deck",
    aspectPadding: "calc(53.649% + 41px)",
  },
  {
    src: "https://demo.arcade.software/h32D5Gvt1I8VgCU1WhtU?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true",
    title: "Create and Customize a Horizontal Bar Chart for Sales Data",
    aspectPadding: "calc(50.1562% + 41px)",
  },
];

export function HowToUseSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);

  const scrollTo = useCallback((i: number) => {
    slideRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    setIndex(i);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.offsetWidth * 0.88 + 32;
    const i = Math.round(el.scrollLeft / slideWidth);
    setIndex(Math.min(Math.max(0, i), EMBEDS.length - 1));
  }, []);

  return (
    <section id="how-it-works" className="scroll-mt-20 bg-[#F2F4F7] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6C5DD3]">
            How it works
          </div>
          <h2 className="text-3xl font-medium uppercase leading-tight tracking-tight text-slate-900 md:text-4xl">
            See Ez2Chart in action
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
            Watch how to mark charts as favorites, build bar charts, and add them
            to a slide deck.
          </p>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="no-scrollbar flex gap-8 overflow-x-auto scroll-smooth pb-4"
            style={{
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {EMBEDS.map((embed, i) => (
              <div
                key={embed.src}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="shrink-0 w-[88%] snap-center md:w-[85%]"
                style={{ scrollSnapAlign: "center" }}
              >
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
                  <div
                    className="relative h-0 w-full"
                    style={{ paddingBottom: embed.aspectPadding }}
                  >
                    <iframe
                      src={embed.src}
                      title={embed.title}
                      frameBorder="0"
                      loading={i === 0 ? "lazy" : "lazy"}
                      allowFullScreen
                      allow="clipboard-write"
                      className="absolute left-0 top-0 h-full w-full rounded-[2rem]"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Faded gradients on both sides – only inactive peeks are faded, active slide stays crisp */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-[#F2F4F7] to-transparent md:w-20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#F2F4F7] to-transparent md:w-20"
            aria-hidden
          />

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollTo(Math.max(0, index - 1))}
              disabled={index === 0}
              aria-label="Previous embed"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex gap-1.5">
              {EMBEDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  aria-label={`Go to embed ${i + 1}`}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    i === index
                      ? "bg-[#6C5DD3]"
                      : "bg-slate-300 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollTo(Math.min(EMBEDS.length - 1, index + 1))}
              disabled={index === EMBEDS.length - 1}
              aria-label="Next embed"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
