'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, Shield, Lock, Server, MessageSquare, Zap } from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';

interface HeroSectionProps {
  onOpenTrial?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenTrial }) => {
  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40 pb-20 sm:pb-28 bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Hafif hareketli modern ambient mesh elementleri */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[20%] right-[5%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-blue-400/15 via-violet-400/10 to-transparent blur-[110px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-[25%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-indigo-400/12 via-blue-300/10 to-transparent blur-[120px] animate-pulse" style={{ animationDuration: '9s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Sol Kolon: Tipografi ve Aksiyonlar (7 cols) */}
          <motion.div 
            className="lg:col-span-7 text-center lg:text-left"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Üst Rozet */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-4 py-1.5 text-xs font-semibold text-violet-800 shadow-sm backdrop-blur-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-ping" />
              <span className="font-mono text-[11px] uppercase tracking-wider">YENİ NESİL ACENTE YÖNETİMİ</span>
              <span className="text-violet-400">•</span>
              <span className="text-violet-900 font-bold">Yapay Zekâ Insurtech</span>
            </div>

            {/* Ana Başlık */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] font-display">
              Eski Nesil Ekranlarda <br className="hidden sm:inline" />
              Kaybolmayın.{' '}
              <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Acentenizin Yeni Akıllı Asistanı MAYA ile Tanışın.
              </span>
            </h1>

            {/* Alt Başlık */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Maya portföyünüzü analiz eder, yenileme kaçaklarını tespit eder ve size WhatsApp'tan sadece{' '}
              <span className="font-semibold text-slate-900 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100">
                "Hatırlatmaları göndereyim mi?"
              </span>{' '}
              diye sorar. Siz onaylarsınız, o satışı kapatır.
            </p>

            {/* Butonlar */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onOpenTrial}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 active:scale-[0.98] transition-all cursor-pointer group"
              >
                <span>14 Gün Ücretsiz Dene</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#maya-whatsapp"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Maya Nasıl Çalışır?</span>
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kredi kartı gerekmez · 14 gün ücretsiz · 2 dakikada kurulum</span>
            </p>

            {/* Güven Rozetleri */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>KVKK Uyumlu</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-600" />
                <span>TR Sunucuları</span>
              </div>
            </div>
          </motion.div>

          {/* Sağ Kolon: Maya Büyük Görsel Yer Tutucu & Yüzen Kartlar (5 cols) */}
          <motion.div 
            className="lg:col-span-5 flex justify-center relative"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Maya Maskot Hero Alanı */}
            <div className="relative">
              <MayaAvatar size="hero" showGlow={true} />

              {/* Yüzen Bildirim Kartı 1 (Sol Üst) */}
              <motion.div 
                className="absolute -top-6 -left-6 sm:-left-12 bg-white/95 border border-slate-200/90 rounded-2xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="h-9 w-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4 text-violet-600" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-violet-600 uppercase font-mono">WhatsApp Vade Hatırlatıcı</div>
                  <div className="text-xs font-bold text-slate-900">7 müşteri için teklif hazırlandı</div>
                </div>
              </motion.div>

              {/* Yüzen Bildirim Kartı 2 (Sağ Alt) */}
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
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
