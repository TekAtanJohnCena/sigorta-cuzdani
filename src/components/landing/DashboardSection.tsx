'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Sparkles, 
  Layers, 
  Building2, 
  Users 
} from 'lucide-react';
import MayaAvatar from './MayaAvatar';

export const DashboardSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bugun' | 'hafta' | 'ay'>('bugun');
  const [dashboardView, setDashboardView] = useState<'genel' | 'policeler' | 'sirketler' | 'personel'>('genel');

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

  const policyCategories = [
    { name: 'Kasko', count: 438, share: '%35', total: '₺4.82M', badge: 'bg-amber-100 text-amber-800' },
    { name: 'Zorunlu Trafik', count: 612, share: '%28', total: '₺2.45M', badge: 'bg-blue-100 text-blue-800' },
    { name: 'Tamamlayıcı Sağlık (TSS)', count: 185, share: '%18', total: '₺1.62M', badge: 'bg-emerald-100 text-emerald-800' },
    { name: 'DASK & Deprem', count: 340, share: '%11', total: '₺410K', badge: 'bg-orange-100 text-orange-800' },
    { name: 'Konut & İşyeri', count: 118, share: '%8', total: '₺1.42M', badge: 'bg-slate-100 text-slate-800' },
  ];

  const insuranceCompanies = [
    { name: 'Anadolu Sigorta', count: 284, premium: '₺2.85M', commission: '₺398K', status: 'Güncel' },
    { name: 'Allianz Sigorta', count: 230, premium: '₺2.42M', commission: '₺362K', status: 'Güncel' },
    { name: 'Axa Sigorta', count: 145, premium: '₺1.65M', commission: '₺248K', status: 'İnceleniyor' },
    { name: 'AkSigorta', count: 128, premium: '₺1.34M', commission: '₺188K', status: 'Güncel' },
    { name: 'Türkiye Sigorta', count: 192, premium: '₺1.21M', commission: '₺145K', status: 'Güncel' },
    { name: 'Sompo Sigorta', count: 76, premium: '₺810K', commission: '₺118K', status: 'Güncel' },
  ];

  const staffMembers = [
    { name: 'Ahmet Yılmaz', role: 'Kasko & Araç Sorumlusu', production: '₺3.2M', policies: 184, target: '%112' },
    { name: 'Zeynep Kaya', role: 'Bireysel Sağlık Danışmanı', production: '₺2.7M', policies: 142, target: '%106' },
    { name: 'Can Demir', role: 'Kurumsal & Yangın Danışmanı', production: '₺2.1M', policies: 98, target: '%94' },
    { name: 'Elif Öztürk', role: 'Yenileme & Müşteri Takibi', production: '₺1.8M', policies: 195, target: '%101' },
  ];

  return (
    <section id="dashboard" className="py-24 sm:py-32 relative bg-slate-50/70 border-t border-slate-200/80 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/70 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-xs mb-4">
            <Layers className="w-4 h-4 text-amber-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">İPLER SİZİN ELİNİZDE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Operasyon WhatsApp'ta, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              Büyük Resim Dashboard'da
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Maya gün içindeki tüm angaryayı WhatsApp üzerinden çözerken, siz modern web panelinizden aktif poliçelerinizi, personelinizin hedeflerini ve kesilen sigorta şirketlerine göre finansal durumunuzu tek ekranda takip edebilirsiniz.
          </p>
        </div>

        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)] p-5 sm:p-7 relative overflow-hidden">
            
            {/* Üst Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">Acente Portföy Paneli</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Canlı Takip
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Son senkronizasyon: 1 dakika önce
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
                  <MayaAvatar size="xs" showGlow={false} />
                  <span>Maya WhatsApp ile Senkron</span>
                </div>

                <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('bugun')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === 'bugun'
                        ? 'bg-white text-amber-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bugün
                  </button>
                  <button
                    onClick={() => setActiveTab('hafta')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === 'hafta'
                        ? 'bg-white text-amber-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bu Hafta
                  </button>
                  <button
                    onClick={() => setActiveTab('ay')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === 'ay'
                        ? 'bg-white text-amber-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bu Ay
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Metrik Kartı */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-amber-300 hover:bg-white transition-all duration-200 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Toplam Prim</span>
                  <div className="p-1 rounded bg-amber-100 text-amber-700">
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

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 hover:border-blue-300 hover:bg-white transition-all duration-200 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  <span>Çapraz Satış</span>
                  <div className="p-1 rounded bg-blue-100 text-blue-600">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-display">
                  {stats.capraz}
                </div>
                <div className="text-xs font-bold text-blue-700 mt-1 flex items-center gap-1">
                  <span>+{stats.caprazDiff}</span>
                  <span className="text-slate-400 font-normal">fırsat tespit edildi</span>
                </div>
              </div>
            </div>

            {/* Görünüm Seçici */}
            <div className="mt-7 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Görünüm:</span>
              
              <button
                onClick={() => setDashboardView('genel')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  dashboardView === 'genel'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Genel & Vadeler</span>
              </button>

              <button
                onClick={() => setDashboardView('policeler')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  dashboardView === 'policeler'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Poliçe Türleri Dağılımı</span>
              </button>

              <button
                onClick={() => setDashboardView('sirketler')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  dashboardView === 'sirketler'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Sigorta Şirketleri Finansalı</span>
              </button>

              <button
                onClick={() => setDashboardView('personel')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  dashboardView === 'personel'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Personel Performansı</span>
              </button>
            </div>

            {/* İçerik */}
            <div className="mt-5">
              <AnimatePresence mode="wait">
                {dashboardView === 'genel' && (
                  <motion.div
                    key="genel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-5"
                  >
                    <div className="lg:col-span-7 rounded-2xl bg-slate-50/70 border border-slate-200/80 p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">Yaklaşan Yenilemeler</h4>
                          <p className="text-xs text-slate-500">Öncelikli 4 poliçe vadesi yaklaşıyor</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200">
                          {stats.vade} Poliçe Sırada
                        </span>
                      </div>

                      <div className="space-y-2">
                        {renewals.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/70 hover:border-amber-300 hover:shadow-xs transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
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

                            <div className="text-right font-extrabold text-slate-900 text-sm sm:text-base font-mono">
                              {item.price}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">Satış Fırsatları</h4>
                            <p className="text-xs text-amber-800">Yüksek potansiyel (Maya Eşleşmesi)</p>
                          </div>
                          <span className="h-6 w-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                            3
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {opportunities.map((opp, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-white border border-amber-200/70 hover:border-amber-400 hover:shadow-xs transition"
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
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[11px]">
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

                      <div className="mt-4 p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Maya bu ay portföyünüzden <b>₺48.500</b> ek çapraz prim fırsatı tespit etti.</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {dashboardView === 'policeler' && (
                  <motion.div
                    key="policeler"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-600" />
                          <span>Poliçe Türlerine Göre Dağılım</span>
                        </h4>
                        <p className="text-xs text-slate-500">Portföyünüzün branş bazında adet ve prim dağılımı</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        Toplam 1.693 Poliçe
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {policyCategories.map((cat, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 transition">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.badge}`}>
                              {cat.share}
                            </span>
                          </div>
                          <div className="mt-3 flex items-baseline justify-between">
                            <div className="text-xs text-slate-500">
                              Adet: <b className="text-slate-800">{cat.count}</b>
                            </div>
                            <div className="text-sm font-black text-slate-900 font-mono">
                              {cat.total}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {dashboardView === 'sirketler' && (
                  <motion.div
                    key="sirketler"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span>Kesilen Sigorta Şirketlerine Göre Finansal Takip</span>
                        </h4>
                        <p className="text-xs text-slate-500">Şirket bazında kesilen prim, acente komisyonu ve bakiye durumu</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        Canlı Şirket Dökümü
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                            <th className="py-2.5 px-3">Sigorta Şirketi</th>
                            <th className="py-2.5 px-3">Poliçe Adedi</th>
                            <th className="py-2.5 px-3">Kesilen Toplam Prim</th>
                            <th className="py-2.5 px-3">Acente Komisyonu</th>
                            <th className="py-2.5 px-3 text-right">Durum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {insuranceCompanies.map((comp, idx) => (
                            <tr key={idx} className="hover:bg-white transition">
                              <td className="py-2.5 px-3 font-bold text-slate-800">{comp.name}</td>
                              <td className="py-2.5 px-3 text-slate-600">{comp.count} adet</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{comp.premium}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{comp.commission}</td>
                              <td className="py-2.5 px-3 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  comp.status === 'Güncel'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {comp.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {dashboardView === 'personel' && (
                  <motion.div
                    key="personel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>Personel & Temsilci Takibi</span>
                        </h4>
                        <p className="text-xs text-slate-500">Danışman bazında kesilen prim, poliçe adedi ve hedef gerçekleştirme</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        4 Aktif Danışman
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {staffMembers.map((staff, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 transition">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{staff.name}</div>
                              <div className="text-[11px] text-slate-500">{staff.role}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {staff.target} Hedef
                            </span>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Üretim: <b className="text-slate-900 font-mono">{staff.production}</b></span>
                            <span className="text-slate-500">Poliçe: <b className="text-slate-900">{staff.policies}</b></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default DashboardSection;
