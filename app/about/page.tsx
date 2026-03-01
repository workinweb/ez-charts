import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AboutChart } from "./_components/about-chart";
import { ShoutOutCards } from "./_components/shout-out-cards";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      {/* Subtle chart-inspired grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #6C5DD3 1px, transparent 1px),
            linear-gradient(to bottom, #6C5DD3 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 py-16 sm:max-w-4xl sm:px-8 sm:py-24 lg:max-w-5xl lg:px-10 xl:max-w-6xl xl:px-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
        <div className="rounded-[24px] bg-white p-8 shadow-lg shadow-black/5 ring-1 ring-black/[0.04] sm:rounded-[28px] sm:p-12 lg:p-16 xl:p-20">
          <div className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6C5DD3]">
            About
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">About Us</h1>
          <p className="mb-10 text-sm text-slate-500">
            Making data visualization accessible to everyone
          </p>

          {/* Fun chart — what powers Ez2Chart */}
          <div className="mb-12">
            <AboutChart />
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Our Mission
              </h2>
              <p>
                Is just to create some tool that can be useful, have the impact
                of current trends like AI-powered applications — but never to
                leave the manual control to the side. It&apos;s your choosing to
                embrace it and to what extent — ease of to use, just a tool that
                works when you need it.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Brought to You by WorkinWeb
              </h2>
              <p>
                This product is brought to you by{" "}
                <a
                  href="https://weworkinweb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#6C5DD3] hover:underline"
                >
                  WorkinWeb
                </a>
                . We build tools that make complex tasks simple and empower
                people to work smarter.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                What We Offer
              </h2>
              <p>
                Ez2Chart combines the power of AI with intuitive controls.
                Create charts through natural conversation, refine them with
                manual editing, and turn your visualizations into polished slide
                decks. Whether you&apos;re analyzing data for work, school, or
                personal projects, we&apos;re here to help.
              </p>
            </section>

            <ShoutOutCards />
          </div>

          <p className="mt-12 pt-8 text-center text-sm text-slate-500">
            <Link
              href="/examples"
              className="font-medium text-[#6C5DD3] hover:underline"
            >
              Explore chart templates
            </Link>
            {" · "}
            <Link
              href="/contact"
              className="font-medium text-[#6C5DD3] hover:underline"
            >
              Contact us
            </Link>
            {" · "}
            <Link
              href="/"
              className="font-medium text-[#6C5DD3] hover:underline"
            >
              Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
