'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, MessageSquare, Zap, Users, Building2, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import MayaAvatar from './MayaAvatar';

interface HeroSectionProps {
  onOpenTrial: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenTrial }) => {
  const [isFlying, setIsFlying] = useState(false);
  const [beeMessage, setBeeMessage] = useState('Vızzz! 🐝 Bugün 7 müşterinizin yenilemesi hazır!');
  const beeContainerRef = useRef<HTMLDivElement>(null);

  const messages = [
    'Vızzz! ⚡ Hızlı uçuş: 7 müşterinin WhatsApp teklifi hazır ve nazır!',
    'Vızzz! 🐝 Çiçek gibi portföy! Bugün tüm yenilemeler kontrolüm altında.',
    'Vızzz! 📊 Portföyünüzü sizin için inceliyorum: 0 kaçak vade!',
    'Vızzz! 🛡️ Maya 7/24 acentenizin nöbetçisi.',
  ];

  // Sevimli çizgi film robot arı "vızzz" sesi (Web Audio API)
  const playBeeBuzzSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfo.frequency.value = 28;
      lfoGain.gain.value = 24;
      lfo.connect(osc.frequency);
      lfo.connect(osc2.frequency);

      osc.type = 'sawtooth';
      osc2.type = 'sine';

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.7);

      osc2.frequency.setValueAtTime(680, now);
      osc2.frequency.exponentialRampToValueAtTime(1120, now + 0.35);
      osc2.frequency.exponentialRampToValueAtTime(840, now + 0.7);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      osc.start(now);
      osc2.start(now);

      lfo.stop(now + 0.8);
      osc.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } catch {
      // Audio playback sessizce korunur
    }
  };

  const handleBeeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlying) return;
    setIsFlying(true);

    playBeeBuzzSound();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 26,
      spread: 60,
      origin: { x, y },
      colors: ['#F59E0B', '#FBBF24', '#D97706', '#FCD34D', '#FEF3C7'],
      shapes: ['circle'],
      scalar: 1.15,
      ticks: 50,
      gravity: 1.1,
    });

    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setBeeMessage(randomMsg);

    setTimeout(() => {
      setIsFlying(false);
    }, 1100);
  };

  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40 pb-20 sm:pb-28 bg-gradient-to-b from-amber-50/40 via-white to-slate-50/50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[15%] right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-400/18 via-yellow-300/12 to-transparent blur-[110px]" />
        <div className="absolute top-[25%] -left-[10%] h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-amber-300/15 via-orange-200/10 to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-dot-pattern-light opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Sol Kolon */}
          <motion.div 
            className="lg:col-span-7 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/70 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-xs mb-6">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-mono text-[11px] uppercase tracking-wider">YENİ NESİL ACENTE ASİSTANI</span>
              <span className="text-amber-400">•</span>
              <span className="text-amber-950 font-bold flex items-center gap-1">
                Maya 🐝 ile Otonom Yönetim
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.14] font-display">
              Eski Nesil Ekranlarda <br className="hidden sm:inline" />
              Kaybolmayın.{' '}
              <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                Acentenizin Yeni Akıllı Asistanı MAYA ile Tanışın.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Maya portföyünüzü analiz eder, yenileme kaçaklarını tespit eder ve size WhatsApp'tan sadece{' '}
              <span className="font-semibold text-slate-900 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">
                "Hatırlatmaları göndereyim mi?"
              </span>{' '}
              diye sorar. Siz onaylarsınız, o satışı kapatır.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onOpenTrial}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer group"
              >
                <span>14 Gün Ücretsiz Dene</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Paneli & Özellikleri Gör</span>
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>14 gün ücretsiz deneme · 2 dakikada kurulum</span>
            </p>

            <div className="mt-9 pt-6 border-t border-slate-200/90 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Personel Hedef Takibi</span>
              </div>
              <div className="text-slate-300">•</div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Poliçe Türleri Dağılımı</span>
              </div>
              <div className="text-slate-300">•</div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Sigorta Şirketleri Finansalları</span>
              </div>
            </div>
          </motion.div>

          {/* Sağ Kolon: Süzülen Arı Maskotu */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative" ref={beeContainerRef}>
              <motion.div
                initial={{ opacity: 0, x: 70, y: -45, scale: 0.85, rotate: -10 }}
                animate={
                  isFlying
                    ? {
                        opacity: 1,
                        x: [0, 18, -18, 10, 0],
                        y: [0, -38, -18, -42, 0],
                        rotate: [0, -14, 16, -8, 0],
                        scale: [1, 1.14, 1.08, 1.04, 1],
                      }
                    : {
                        opacity: 1,
                        x: 0,
                        y: [0, -8, 0],
                        scale: 1,
                        rotate: [0, 1.5, -1.5, 0],
                      }
                }
                transition={
                  isFlying
                    ? { duration: 1.05, ease: 'easeInOut' }
                    : {
                        opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                        x: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
                        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                        rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                      }
                }
                onClick={handleBeeClick}
                className="cursor-pointer relative z-10 select-none group"
                title="Maya'ya tıklayın: Vızıldasın ve uçsun!"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.35 }}
                  className="absolute -top-7 right-2 sm:-right-4 px-3.5 py-2 rounded-2xl bg-white shadow-xl border border-amber-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 z-20 whitespace-nowrap"
                >
                  <span className="text-amber-500 font-bold text-sm">✨</span>
                  <span>{beeMessage}</span>
                  <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-amber-300 transform rotate-45" />
                </motion.div>

                <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                  <img
                    src="/brand/maya.png"
                    alt="Maya — Akıllı Acente Robot Arı Asistanı"
                    className="w-full h-full object-contain filter contrast-105 drop-shadow-[0_20px_35px_rgba(245,158,11,0.28)] transition-transform duration-300 group-hover:scale-105 active:scale-95"
                  />
                </div>

                <motion.div
                  animate={
                    isFlying
                      ? { scale: [1, 0.6, 0.8, 0.5, 1], opacity: [0.12, 0.04, 0.08, 0.03, 0.12] }
                      : { scale: [1, 0.94, 1], opacity: 0.12 }
                  }
                  transition={isFlying ? { duration: 1.05 } : { duration: 3.5, repeat: Infinity }}
                  className="w-44 h-4 bg-slate-900 rounded-[100%] blur-sm mx-auto -mt-2"
                />
              </motion.div>

              <motion.div 
                className="absolute -top-4 -left-6 sm:-left-12 bg-white/95 border border-slate-200/90 rounded-2xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-amber-700 uppercase font-mono">WhatsApp Vade Takibi</div>
                  <div className="text-xs font-bold text-slate-900">7 müşteri için teklif hazırlandı</div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -bottom-6 -right-6 sm:-right-8 bg-white/95 border border-slate-200/90 rounded-2xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase font-mono">Akıllı Çapraz Satış</div>
                  <div className="text-xs font-bold text-slate-900">Kasko → DASK %92 uyum</div>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
