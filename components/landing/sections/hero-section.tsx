import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight text-[#3D4035]">
        Create charts with AI
      </h1>
      <p className="mt-4 max-w-xl text-[17px] text-[#3D4035]/70 sm:text-[18px]">
        Turn your data into beautiful charts. Connect your files, chat with AI, or build manually.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          size="lg"
          className="rounded-xl bg-[#6C5DD3] px-6 py-6 text-[15px] font-semibold text-white hover:bg-[#5a4dbf]"
        >
          <Link href="/ezcharts">Get started</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-xl border-[#3D4035]/25 px-6 py-6 text-[15px] font-semibold text-[#3D4035] hover:bg-[#3D4035]/5"
        >
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </section>
  );
}
