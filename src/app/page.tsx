"use client";

import Navbar from "@/components/landing/Navbar";
import ScrollProgress from "@/components/landing/ScrollProgress";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import BentoFeatures from "@/components/landing/BentoFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import SecurityBanner from "@/components/landing/SecurityBanner";
import PricingSection from "@/components/landing/PricingSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";
import "./landing.css";

export default function LandingPage() {
  return (
    <div className="lp">
      <ScrollProgress />
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <BentoFeatures />
        <HowItWorks />
        <SecurityBanner />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
