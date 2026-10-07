'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Clock, Layers, Wallet, BarChart3, Users } from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';

export const DashboardSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bugun' | 'hafta' | 'ay'>('bugun');

  const stats = {
    bugun: { prim: '₺847K', primDiff: '+12.3%', police: '1.247', vade: '23', capraz: '41' },
    hafta: { prim: '₺2.4M', primDiff: '+18.1%', police: '1.385', vade: '68', capraz: '124' },
    ay: { prim: '₺9.8M', primDiff: '+24.6%', police: '1.920', vade: '156', capraz: '420' },
  }[activeTab];

  const renewals = [
    { initials: 'MK', name: 'Mehmet Kaya', type: 'Kasko', days: '2 gün', price: '₺12.450', urgent: true },
    { initials: 'AY', name: 'Ayşe Yılmaz', type: 'DASK', days: '5 gün', price: '₺890', urgent: false },
    { initials: 'AD', name: 'Ahmet Demir', type: 'Trafik', days: '7 gün', price: '₺2.140', urgent: false },
  ];

  return (
    <section id="dashboard" className="py-24 sm:py-32 relative bg-white border-t border-slate-100 overflow-hidden perspective-1000">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/50 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-blue-800 shadow-sm mb-6">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">İPLER SİZİN ELİNİZDE</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Büyük Resim <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard&apos;da
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Maya gün içindeki angaryayı WhatsApp&apos;tan çözerken, siz modern web panelinizden tüm metrikleri gerçek zamanlı izleyin.
          </p>
        </div>

        {/* 3D Dashboard Mockup Presentation */}
        <motion.div
          className="max-w-5xl mx-auto relative"
          initial={{ opacity: 0, rotateX: 20, y: 50 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Main Dashboard Container */}
          <div className="rounded-[2.5rem] bg-white border border-slate-200 shadow-[0_30px_100px_-20px_rgba(15,23,42,0.15)] p-6 sm:p-8 relative overflow-hidden backdrop-blur-2xl">
            
            {/* Top Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Finansal Özet</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Son senkronizasyon: 1 dakika önce
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50/80 border border-violet-100 text-violet-800 text-xs font-bold">
                  <MayaAvatar size="xs" showGlow={false} />
                  <span>Maya ile Senkronize</span>
                </div>

                <div className="inline-flex p-1 bg-slate-100/80 rounded-xl text-sm font-bold backdrop-blur-md border border-slate-200/50">
                  <button onClick={() => setActiveTab('bugun')} className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'bugun' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Bugün</button>
                  <button onClick={() => setActiveTab('hafta')} className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'hafta' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Hafta</button>
                  <button onClick={() => setActiveTab('ay')} className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'ay' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Ay</button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
              
              {/* Left Column: Big Stats */}
              <div className="lg:col-span-4 space-y-6">
                {/* Total Premium Card - High visual priority */}
                <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                        <Wallet className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {stats.primDiff}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-400 mb-1">Toplam Prim Üretimi</div>
                    <div className="text-4xl font-black font-display tracking-tight">{stats.prim}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                    <BarChart3 className="w-6 h-6 text-indigo-600 mb-3" />
                    <div className="text-2xl font-bold text-slate-900">{stats.police}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Aktif Poliçe</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                    <Users className="w-6 h-6 text-violet-600 mb-3" />
                    <div className="text-2xl font-bold text-slate-900">{stats.capraz}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Çapraz Fırsat</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Renewals List */}
              <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-slate-900">Yaklaşan Yenilemeler</h4>
                  <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Tümünü Gör ({stats.vade})</button>
                </div>
                
                <div className="space-y-3">
                  {renewals.map((item, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-50 group-hover:text-blue-700 transition-colors">
                          {item.initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {item.name}
                            {item.urgent && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold uppercase tracking-wider">
                                Acil
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 mt-0.5 font-medium">
                            {item.type} • Vadeye {item.days}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-lg font-mono">{item.price}</div>
                        <div className="text-[11px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Maya Teklifi Hazır</div>
                      </div>
                    </div>
                  ))}
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
