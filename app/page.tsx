import Link from "next/link";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-[18px] font-semibold text-[#3D4035]"
        >
          <BarChart3 className="size-8 text-[#6C5DD3]" />
          Charts AI
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-xl px-4 py-2 text-[14px] font-medium text-[#3D4035]/70 hover:text-[#3D4035]"
          >
            Sign in
          </Link>
          <Link
            href="/ezcharts"
            className="rounded-xl bg-[#6C5DD3] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#5a4dbf]"
          >
            Get started
          </Link>
        </div>
      </header>

      <main>
        <HeroSection />
      </main>
    </div>
  );
}
