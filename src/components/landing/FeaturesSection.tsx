'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Layers, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const cards = [
    {
      id: 1,
      tag: '01 • PERSONEL TAKİBİ',
      title: 'Acente Danışman Karnesi ve Hedef Takibi',
      description: 'Hangi çalışanınız hangi branşta hedefinin üzerinde? Danışman bazında kesilen primleri, poliçe adetlerini ve kota gerçekleşmelerini tek ekrandan şeffafça izleyin.',
      icon: Users,
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
      microUi: (
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>Ahmet Y. (Araç Branşı)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              %112 Hedef
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: '100%' }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1">
            <span>Üretim: <b className="text-slate-800 font-mono">₺3.2M</b></span>
            <span>Poliçe: <b className="text-slate-800 font-mono">184</b></span>
          </div>
        </div>
      )
    },
    {
      id: 2,
      tag: '02 • POLİÇE TÜRLERİ',
      title: 'Branş Dağılımı ve Akıllı Çapraz Satış',
      description: 'Kasko, Trafik, Tamamlayıcı Sağlık ve DASK portföyünüzün ağırlığını görün. Maya, kaskosu olan müşteriyi tespit edip en uygun zamanda sağlık veya DASK çapraz satış teklifini hazırlar.',
      icon: Layers,
      badgeBg: 'bg-blue-50 text-blue-900 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-700',
      microUi: (
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Can Öztürk (Kasko Aktif)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              %92 Uyum
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Kasko</span>
            <span className="text-slate-400">→</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">DASK & TSS Önerisi</span>
          </div>
          <div className="pt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>WhatsApp teklif onayı hazır</span>
          </div>
        </div>
      )
    },
    {
      id: 3,
      tag: '03 • ŞİRKETLER FİNANSALI',
      title: 'Kesilen Sigorta Şirketlerine Göre Takip',
      description: 'Anadolu, Allianz, Axa, AkSigorta ve diğer şirketlere kesilen poliçelerden doğan toplam prim ve acente komisyon durumunuzu anlık olarak karşılaştırın.',
      icon: Building2,
      badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
      microUi: (
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span>Şirket Bazlı Prim</span>
            <span className="text-emerald-700">Komisyon</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center p-1.5 rounded-lg bg-white border border-slate-200 text-[11px]">
              <span className="font-semibold text-slate-800">Anadolu Sigorta</span>
              <span className="font-mono font-bold text-emerald-700">₺398K</span>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded-lg bg-white border border-slate-200 text-[11px]">
              <span className="font-semibold text-slate-800">Allianz Sigorta</span>
              <span className="font-mono font-bold text-emerald-700">₺362K</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="ozellikler" className="py-24 sm:py-32 relative bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Bölüm Başlığı */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/70 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-xs mb-4">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">MAYA'NIN ÇALIŞMA MEKANİZMASI</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Acentenizin Çarkları Tıkır Tıkır İşlesin
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Siz müşterilerinizle kahvenizi içerken, Maya arka planda personelinizi, şirketlerinizi ve poliçelerinizi izleyerek operasyonu kolaylaştırır.
          </p>
        </div>

        {/* 3 Kart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                className="relative rounded-3xl bg-white border border-slate-200/90 p-7 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between group"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
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
