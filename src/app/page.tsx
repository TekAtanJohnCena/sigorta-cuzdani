"use client";

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustStrip from "@/components/landing/TrustStrip";
import BentoFeatures from "@/components/landing/BentoFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import SecurityBanner from "@/components/landing/SecurityBanner";
import PricingSection from "@/components/landing/PricingSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";
import "./landing.css";

export default function LandingPage() {
  return (
    <div className="lp">
      <Navbar />
      <main>
        <HeroSection />
        <TrustStrip />
        <BentoFeatures />
        <HowItWorks />
        <Testimonials />
        <SecurityBanner />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
