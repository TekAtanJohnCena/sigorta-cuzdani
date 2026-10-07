'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import WhatsAppSection from '@/components/landing/WhatsAppSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import DashboardSection from '@/components/landing/DashboardSection';
import MetricsSection from '@/components/landing/MetricsSection';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';
import TrialModal from '@/components/landing/TrialModal';
import SmoothScroll from '@/components/landing/SmoothScroll';

export default function LandingPage() {
  const [trialModalOpen, setTrialModalOpen] = useState(false);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600/20 selection:text-blue-900">
        {/* 1. Navbar */}
        <Navbar onOpenTrial={() => setTrialModalOpen(true)} />

        {/* Ana Bölümler */}
        <main>
          {/* 1. Hero Bölümü (Maya Maskot Placeholder + Başlıklar) */}
          <HeroSection onOpenTrial={() => setTrialModalOpen(true)} />

          {/* 2. Etkileşimli WhatsApp Bölümü (Mobil Chat Mockup + Sohbet Akışı) */}
          <WhatsAppSection />

          {/* 3. Özellikler Bölümü (3 Kart: Çapraz Satış, Churn, Raporlar) */}
          <FeaturesSection />

          {/* 4. Dashboard Bölümü (İpler Sizin Elinizde + Canlı CRM Paneli) */}
          <DashboardSection />

          {/* 5. Gerçek Sonuçlar (Metrikler + Sayaç Animasyonu) */}
          <MetricsSection />

          {/* 6. Fiyatlandırma ve Güven Öğeleri (2 Plan + Güven Rozetleri) */}
          <PricingSection onOpenTrial={() => setTrialModalOpen(true)} />
        </main>

        {/* Footer */}
        <Footer />

        {/* 14 Gün Ücretsiz Başla Modalı */}
        <TrialModal
          isOpen={trialModalOpen}
          onClose={() => setTrialModalOpen(false)}
        />
      </div>
    </SmoothScroll>
  );
}
