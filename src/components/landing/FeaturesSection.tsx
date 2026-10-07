'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldAlert, TrendingUp, Target, ArrowRight } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  return (
    <section id="ozellikler" className="py-24 sm:py-32 relative bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/50 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-violet-800 shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">MAYA&apos;NIN ÇALIŞMA MEKANİZMASI</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display mb-6">
            Arka Planda <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Neler Oluyor?</span>
          </h2>

          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Siz müşterilerinizle ilgilenirken, Maya arka planda milyonlarca veri noktasını tarar. B2B Insurtech'in gücünü keşfedin.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(280px,auto)]">
          
          {/* Card 1: Cross-Sell Engine (Large span) */}
          <motion.div 
            className="md:col-span-8 rounded-[2rem] bg-white border border-slate-200/80 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-20 -mt-20 transition-transform group-hover:scale-110 duration-700" />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-8 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Davranışsal Çapraz Satış Motoru</h3>
                <p className="text-slate-600 leading-relaxed">
                  Müşterinin yaşı, araba modeli, araç yılı gibi metrikleri analiz edilerek en uygun poliçe eşleştirmesi yapılır. Satın alma ihtimali yüksek müşteriler için çapraz satış mesajları WhatsApp&apos;tan hazırlanır.
                </p>
              </div>
              
              <div className="flex-1 w-full max-w-sm shrink-0">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-800 text-sm">Can Öztürk (38 Yaş • SUV 2022)</span>
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                      %92 Uyum
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">Kasko</span>
                    <span className="text-slate-400">→</span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20">Tamamlayıcı Sağlık</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[92%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Churn Analysis (Small span) */}
          <motion.div 
            className="md:col-span-4 rounded-[2rem] bg-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl relative overflow-hidden group text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-[60px] transition-transform group-hover:scale-125 duration-700" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Kayıpsız Yenileme & Churn</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Hangi müşterinin portföyden çıkma riski olduğunu önceden bilin. Maya riskli müşterileri ayırır ve size uyarır.
              </p>
              
              <div className="mt-auto bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold">Mehmet Kaya</span>
                  <span className="text-xs text-rose-400 font-bold bg-rose-400/10 px-2 py-0.5 rounded">Risk: %78</span>
                </div>
                <div className="text-xs text-slate-300">İndirimli kasko teklifi öneriliyor</div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Reports (Small span) */}
          <motion.div 
            className="md:col-span-4 rounded-[2rem] bg-white border border-slate-200/80 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Otomatik Raporlar</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Günlük, haftalık ve aylık büyüme raporları WhatsApp&apos;ınıza gelir. Sisteme girmeden büyük resmi görün.
              </p>
              
              <div className="mt-auto grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div className="text-emerald-600 font-bold text-lg">₺284K</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Haftalık Prim</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div className="text-blue-600 font-bold text-lg">42</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Yeni Poliçe</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Action/Call (Large span) */}
          <motion.div 
            className="md:col-span-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-8 sm:p-10 shadow-2xl shadow-indigo-600/20 relative overflow-hidden flex items-center text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Abstract shapes */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            
            <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-3xl font-extrabold mb-4 leading-tight">Zamanınızı geri kazanın.<br/>Müşterinize odaklanın.</h3>
                <p className="text-indigo-100 max-w-md">
                  Maya tüm operasyonel yükü alırken siz satışlarınızı artırın. 14 gün ücretsiz deneme ile hemen başlayın.
                </p>
              </div>
              <button className="shrink-0 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                Hemen Başla
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
