import { AIChatSection } from "@/components/landing/sections/ai-chat-section";
import { ChartLibrariesSection } from "@/components/landing/sections/chart-libraries-section";
import { CTASection } from "@/components/landing/sections/cta-section";
import { FeaturesSection } from "@/components/landing/sections/features-section";
import { FooterSection } from "@/components/landing/sections/footer-section";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { HowToUseSection } from "@/components/landing/sections/how-to-use-section";
import { ManualStudioSection } from "@/components/landing/sections/manual-studio-section";
import { LandingNavbar } from "@/components/landing/sections/navbar-section";
import { PricingSection } from "@/components/landing/sections/pricing-section";
import { PromptExamplesSection } from "@/components/landing/sections/prompt-examples-section";
import { TemplatesSection } from "@/components/landing/sections/templates-section";
import { TrustedBySection } from "@/components/landing/sections/trusted-by-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Generate stunning charts instantly with AI. Chat with your data, edit manually, export to PNG. Bar, line, pie, area charts—no code required.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#1A1A1A] antialiased overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <AIChatSection />
        <PromptExamplesSection />
        <ManualStudioSection />
        <TemplatesSection />
        <ChartLibrariesSection />
        <HowToUseSection />
        <PricingSection />
        <CTASection />
        <FooterSection />
      </main>
    </div>
  );
}
