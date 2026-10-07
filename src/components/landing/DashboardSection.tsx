'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Sparkles, 
  Layers 
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';

export const DashboardSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bugun' | 'hafta' | 'ay'>('bugun');

  const stats = {
    bugun: {
      prim: '₺847K',
      primDiff: '+12.3%',
      police: '1.247',
      policeDiff: '+8',
      vade: '23',
      vadeTime: '7 gün',
      capraz: '41',
      caprazDiff: '+15',
    },
    hafta: {
      prim: '₺2.4M',
      primDiff: '+18.1%',
      police: '1.385',
      policeDiff: '+48',
      vade: '68',
      vadeTime: '14 gün',
      capraz: '124',
      caprazDiff: '+36',
    },
    ay: {
      prim: '₺9.8M',
      primDiff: '+24.6%',
      police: '1.920',
      policeDiff: '+184',
      vade: '156',
      vadeTime: '30 gün',
      capraz: '420',
      caprazDiff: '+98',
    },
  }[activeTab];

  const renewals = [
    { initials: 'MK', name: 'Mehmet Kaya', type: 'Kasko', days: '2 gün', price: '₺12.450', urgent: true },
    { initials: 'AY', name: 'Ayşe Yılmaz', type: 'DASK', days: '5 gün', price: '₺890', urgent: false },
    { initials: 'AD', name: 'Ahmet Demir', type: 'Trafik', days: '7 gün', price: '₺2.140', urgent: false },
    { initials: 'ZŞ', name: 'Zeynep Şahin', type: 'Sağlık', days: '9 gün', price: '₺8.750', urgent: false },
  ];

  const opportunities = [
    { name: 'Can Öztürk', match: '92%', from: 'Kasko', to: 'DASK', price: '₺980' },
    { name: 'Elif Arslan', match: '88%', from: 'Trafik', to: 'Kasko', price: '₺11.2K' },
    { name: 'Burak Çelik', match: '85%', from: 'Konut', to: 'DASK', price: '₺1.450' },
  ];

  return (
    <section id="dashboard" className="py-24 sm:py-32 relative bg-slate-50/70 border-t border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Başlık ve Açıklama */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-800 shadow-sm mb-4">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">İPLER SİZİN ELİNİZDE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Operasyon WhatsApp'ta, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Büyük Resim Dashboard'da
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Maya gün içindeki tüm angaryayı WhatsApp üzerinden çözerken, siz dilediğiniz an modern web panelinize girerek aktif poliçelerinizi, toplam prim üretimini (Örn: ₺847K), yaklaşan vadeleri ve satış fırsatlarını tek ekranda görebilirsiniz.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] p-5 sm:p-7 relative overflow-hidden">
            
            {/* Üst Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">Dashboard</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Bugünün Özeti
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Son senkronizasyon: 1 dakika önce
                  </p>
                </div>
              </div>

              {/* Maya Senkronizasyon Rozeti ve Tab Filtreleri */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200/80 text-violet-800 text-xs font-semibold">
                  <MayaAvatar size="xs" showGlow={false} />
                  <span>Maya WhatsApp ile Senkron</span>
                </div>

                <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('bugun')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === 'bugun'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bugün
                  </button>
                  <button
                    onClick={() => setActiveTab('hafta')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === 'hafta'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bu Hafta
                  </button>
                  <button
                    onClick={() => setActiveTab('ay')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === 'ay'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bu Ay
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Ana Metrik Kartı */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
              
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-blue-300 hover:bg-white transition-all duration-200 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Toplam Prim</span>
                  <div className="p-1 rounded bg-blue-100 text-blue-600">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-display">
                  {stats.prim}
                </div>
                <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                  <span>{stats.primDiff}</span>
                  <span className="text-slate-400 font-normal">geçen döneme göre</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 hover:bg-white transition-all duration-200 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Aktif Poliçe</span>
                  <div className="p-1 rounded bg-emerald-100 text-emerald-600">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-display">
                  {stats.police}
                </div>
                <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                  <span>+{stats.policeDiff}</span>
                  <span className="text-slate-400 font-normal">yeni poliçe</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 hover:border-amber-300 hover:bg-white transition-all duration-200 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  <span>Yaklaşan Vade</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                    {stats.vadeTime}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-display">
                  {stats.vade}
                </div>
                <div className="text-xs font-bold text-amber-800 mt-1">
                  Maya takibinde
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-200/80 hover:border-violet-300 hover:bg-white transition-all duration-200 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-violet-800 uppercase tracking-wider">
                  <span>Çapraz Satış</span>
                  <div className="p-1 rounded bg-violet-100 text-violet-600">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-display">
                  {stats.capraz}
                </div>
                <div className="text-xs font-bold text-violet-700 mt-1 flex items-center gap-1">
                  <span>+{stats.caprazDiff}</span>
                  <span className="text-slate-400 font-normal">fırsat tespit edildi</span>
                </div>
              </div>

            </div>

            {/* İki Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
              
              {/* Sol: Yaklaşan Yenilemeler */}
              <div className="lg:col-span-7 rounded-2xl bg-slate-50/70 border border-slate-200/80 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">Yaklaşan Yenilemeler</h4>
                    <p className="text-xs text-slate-500">Öncelikli 4 poliçe vadesi yaklaşıyor</p>
                  </div>
                  <button className="px-3 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                    Tümü ({stats.vade})
                  </button>
                </div>

                <div className="space-y-2">
                  {renewals.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/70 hover:border-blue-300 hover:shadow-xs transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {item.initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {item.name}
                            {item.urgent && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-50 text-rose-600 font-semibold border border-rose-200">
                                2 Gün Kaldı
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-slate-700">{item.type}</span>
                            <span>•</span>
                            <span className={item.urgent ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                              {item.days}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 text-sm sm:text-base font-mono">
                          {item.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sağ: Satış Fırsatları */}
              <div className="lg:col-span-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-emerald-950 text-sm sm:text-base">Satış Fırsatları</h4>
                      <p className="text-xs text-emerald-700">Yüksek potansiyel (Maya Eşleşmesi)</p>
                    </div>
                    <span className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {opportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-emerald-200/70 hover:border-emerald-400 hover:shadow-xs transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{opp.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                            {opp.match} Uyum
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {opp.from}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-[11px]">
                              {opp.to}
                            </span>
                          </div>

                          <div className="font-extrabold text-slate-900 text-sm font-mono">
                            {opp.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Maya bu ay portföyünüzden <b>₺48.500</b> ek çapraz prim fırsatı tespit etti.</span>
                </div>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default DashboardSection;
