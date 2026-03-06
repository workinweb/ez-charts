"use client";

export function HowToUseSection() {
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
            Watch how to mark charts as favorites and add them to a slide deck.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
          <div
            className="relative h-0 w-full"
            style={{ paddingBottom: "calc(53.649% + 41px)" }}
          >
            <iframe
              src="https://demo.arcade.software/YeNrCkNDt40v2jTluvSa?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true"
              title="Mark Charts as Favorites and Add Them to a Slide Deck"
              frameBorder="0"
              loading="lazy"
              allowFullScreen
              allow="clipboard-write"
              className="absolute left-0 top-0 h-full w-full rounded-[2rem]"
              style={{ colorScheme: "light" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
