"use client";

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import BentoFeatures from "@/components/landing/BentoFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import SecurityBanner from "@/components/landing/SecurityBanner";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";
import "./landing.css";

export default function LandingPage() {
  return (
    <div className="lp">
      <Navbar />
      <main>
        <HeroSection />
        <BentoFeatures />
        <HowItWorks />
        <SecurityBanner />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
