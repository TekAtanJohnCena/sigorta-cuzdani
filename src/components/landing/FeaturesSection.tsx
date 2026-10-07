'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldAlert, TrendingUp, Target } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const cards = [
    {
      id: 1,
      tag: '01 • AKILLI EŞLEŞTİRME',
      title: 'Davranışsal Çapraz Satış (Cross-Sell) Motoru',
      description: 'Müşterinin yaşı, araba modeli, araç yılı gibi metrikleri analiz edilerek en uygun poliçe eşleştirmesi yapılır. Satın alma ihtimali en yüksek müşteriler için çapraz satış mesajları Maya tarafından hazırlanır, size sadece onaylamak kalır.',
      icon: Target,
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
      microUi: (
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Can Öztürk (38 Yaş • SUV 2022)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              %92 Uyum
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
              Kasko Mevcut
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 border border-blue-200 text-blue-800 font-semibold">
              Tamamlayıcı Sağlık & DASK
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Maya Teklifi Hazırlandı</span>
            <span className="text-blue-600 font-bold">1-Tık Onay Bekliyor</span>
          </div>
        </div>
      )
    },
    {
      id: 2,
      tag: '02 • RİSK KALKANI',
      title: 'Kayıpsız Yenileme & Churn Analizi',
      description: 'Hangi müşterinin portföyden çıkma riski olduğunu önceden bilin. Maya riskli müşterileri ayırır ve size "Bu müşteriyle özel ilgilen" uyarısı geçer.',
      icon: ShieldAlert,
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
      microUi: (
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-950">Mehmet Kaya (Kasko • ₺12.450)</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
              Risk: Yüksek (%78 Churn)
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            Fiyat hassasiyeti ve son hasar kaydı analizi: Müşteri alternatif teklif arayışında.
          </p>
          <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px]">
            <span className="text-amber-900 font-semibold">Maya Önerisi: İndirimli Yenileme + Arama</span>
            <span className="text-rose-600 font-bold">Acil</span>
          </div>
        </div>
      )
    },
    {
      id: 3,
      tag: '03 • RAPORLAMA',
      title: 'Otomatik Büyüme Raporları',
      description: 'Sisteme giriş yapmanıza gerek kalmadan; günlük, haftalık ve aylık bazda "Acenteniz finansal olarak ne kadar büyüdü?" raporları doğrudan WhatsApp\'ınıza gelir.',
      icon: TrendingUp,
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
      microUi: (
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
            <span>Haftalık WhatsApp Büyüme Brifingi</span>
            <span className="text-emerald-600 font-mono">+%18 Büyüme</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">42</div>
              <div className="text-[10px] text-slate-500">Poliçe</div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-emerald-600 text-sm">₺284K</div>
              <div className="text-[10px] text-slate-500">Prim</div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-blue-600 text-sm">%0</div>
              <div className="text-[10px] text-slate-500">Kaçak</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="ozellikler" className="py-24 sm:py-32 relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Bölüm Başlığı */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-800 shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">MAYA'NIN ÇALIŞMA MEKANİZMASI</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Arka Planda Neler Oluyor?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Siz acentenizi yönetirken veya müşterilerinizle kahve içerken, 
            Maya arka planda milyonlarca veri noktasını tarayarak acentenizin kârını korur.
          </p>
        </div>

        {/* 3 Şık Kart Tasarımı */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                className="relative rounded-3xl bg-white border border-slate-200/90 p-7 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${card.badgeBg}`}>
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div>
                  {card.microUi}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
