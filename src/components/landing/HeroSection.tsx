'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, MessageSquare, Zap, Shield, TrendingUp, CheckCircle2 } from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';

interface HeroSectionProps {
  onOpenTrial?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenTrial }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30, mass: 1 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30, mass: 1 });

  // Map mouse position to rotation (-15 to +15 degrees)
  const rotateX = useTransform(springY, [-1, 1], [10, -10]);
  const rotateY = useTransform(springX, [-1, 1], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Normalize mouse coordinates between -1 and 1
      const x = (e.clientX - rect.left) / rect.width * 2 - 1;
      const y = (e.clientY - rect.top) / rect.height * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [mouseX, mouseY]);

  return (
    <section 
      ref={containerRef}
      className="relative overflow-hidden pt-32 sm:pt-40 pb-20 sm:pb-32 bg-[#F8FAFC] perspective-1000"
      style={{ perspective: '1200px' }}
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/10 blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-400/10 to-emerald-400/10 blur-[90px] mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Text Content */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/50 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            <span className="font-mono text-[11px] uppercase tracking-wider">Acentenizin Yeni Akıllı Asistanı</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05] font-display">
            Eski Ekranları Bırakın.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Maya ile Tanışın.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Maya portföyünüzü analiz eder, yenileme kaçaklarını tespit eder ve size WhatsApp&apos;tan sadece{' '}
            <span className="font-semibold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
              &quot;Hatırlatmaları göndereyim mi?&quot;
            </span>{' '}
            diye sorar. Siz onaylarsınız, o satışı kapatır.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenTrial}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <span>14 Gün Ücretsiz Dene</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="#maya-whatsapp"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm px-7 py-4 text-base font-bold text-slate-700 hover:bg-white hover:border-slate-300 hover:text-slate-900 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Maya Nasıl Çalışır?</span>
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Kredi kartı gerekmez</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> 2 dakikada kurulum</span>
          </div>
        </motion.div>

        {/* 3D Interactive Hero Scene */}
        <motion.div 
          className="relative w-full h-[500px] sm:h-[600px] mt-10 flex items-center justify-center transform-style-3d"
          style={{ rotateX, rotateY }}
        >
          {/* Central Maya Mascot */}
          <motion.div 
            className="absolute z-30"
            style={{ translateZ: 100 }}
          >
            <MayaAvatar size="hero" showGlow={true} showStatus={true} />
          </motion.div>

          {/* Floating Card 1: WhatsApp Message (Top Left) */}
          <motion.div 
            className="absolute top-[10%] left-[5%] sm:left-[15%] z-40 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-4 shadow-2xl flex items-center gap-4 w-64"
            style={{ translateZ: 150 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-mono mb-0.5">WhatsApp Senkronu</div>
              <div className="text-sm font-extrabold text-slate-900 leading-tight">7 müşteriye teklif iletildi</div>
            </div>
          </motion.div>

          {/* Floating Card 2: Growth Chart (Bottom Right) */}
          <motion.div 
            className="absolute bottom-[15%] right-[5%] sm:right-[15%] z-20 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-2xl w-60"
            style={{ translateZ: 80 }}
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                +%35
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-display">₺847K</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Aylık Prim Üretimi</div>
          </motion.div>

          {/* Floating Card 3: Shield/Protection (Top Right) */}
          <motion.div 
            className="absolute top-[20%] right-[10%] sm:right-[20%] z-10 bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-3 shadow-xl flex items-center gap-3"
            style={{ translateZ: 40 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xs font-bold text-slate-800">Churn Koruması Aktif</div>
          </motion.div>

          {/* Floating Card 4: Cross-Sell (Bottom Left) */}
          <motion.div 
            className="absolute bottom-[25%] left-[10%] sm:left-[22%] z-20 bg-violet-600 rounded-2xl p-4 shadow-2xl shadow-violet-600/30 text-white w-48"
            style={{ translateZ: 120 }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Fırsat</span>
            </div>
            <div className="text-sm font-bold">Kasko → DASK %92 Uyum Analizi</div>
          </motion.div>

          {/* Decorative Circles in 3D Space */}
          <motion.div className="absolute w-[400px] h-[400px] border border-slate-200 rounded-full" style={{ translateZ: -50 }} />
          <motion.div className="absolute w-[600px] h-[600px] border border-slate-200/50 rounded-full" style={{ translateZ: -100 }} />
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
