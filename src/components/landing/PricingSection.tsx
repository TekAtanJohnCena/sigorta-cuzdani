'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Shield, Lock, Server, Sparkles, Building2 } from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';

interface PricingSectionProps {
  onOpenTrial?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenTrial }) => {
  return (
    <section id="fiyatlandirma" className="py-24 sm:py-32 relative bg-slate-50/70 border-t border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Bölüm Başlığı */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-800 shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">ŞEFFAF VE BASİT MODEL</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Acentenize Uygun Planı Seçin
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Hiçbir gizli ücret veya karmaşık modül yok. Maya ile acentenizi hemen dijitalleştirin.
          </p>
        </div>

        {/* 2 Fiyat Tablosu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Plan 1: Profesyonel (₺2.000/ay) */}
          <motion.div
            className="relative rounded-3xl bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/10 p-8 sm:p-9 flex flex-col justify-between"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Popüler Rozeti */}
            <div className="absolute -top-3.5 left-8">
              <span className="px-3.5 py-1 rounded-full bg-blue-600 text-white font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                EN ÇOK TERCİH EDİLEN
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 font-display">Profesyonel</h3>
                <MayaAvatar size="sm" showGlow={false} />
              </div>
              
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Bağımsız sigorta acenteleri için tam teşekküllü Maya yapay zekâ asistanı ve otomasyon.
              </p>

              {/* Fiyat */}
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 font-display">
                  ₺2.000
                </span>
                <span className="text-slate-500 text-sm font-semibold">/ ay</span>
              </div>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">
                Kredi kartsız 14 gün ücretsiz deneme dahildir
              </p>

              {/* Özellikler */}
              <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
                {[
                  'MAYA Yapay Zekâ Asistanı (WhatsApp Entegre)',
                  'Otomatik WhatsApp Vade Hatırlatma & Teklifler',
                  'Davranışsal Çapraz Satış (Cross-Sell) Motoru',
                  'Kayıpsız Yenileme & Churn Analizi Kalkanı',
                  'Sınırsız Poliçe ve Müşteri Portföyü',
                  'Otomatik Günlük / Haftalık Büyüme Raporları',
                  'Modern Web Acente Dashboard ve Canlı Metrikler',
                  'Excel ve PDF Dosyalarından Otomatik Veri Aktarımı',
                  '7/24 Öncelikli Destek Hattı',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={onOpenTrial}
                className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>14 Gün Ücretsiz Başla</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Kurulum 2 dakika • Taahhüt ve ceza yok
              </p>
            </div>
          </motion.div>

          {/* Plan 2: Kurumsal (Özel Fiyat) */}
          <motion.div
            className="relative rounded-3xl bg-white border border-slate-200/90 shadow-sm p-8 sm:p-9 flex flex-col justify-between hover:border-slate-300 transition"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 font-display">Kurumsal</h3>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Çoklu şube ağı olan acenteler, tali acente yapıları ve yüksek hacimli brokerlar için.
              </p>

              {/* Fiyat */}
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 font-display">
                  Özel Fiyat
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Acente hacminize ve kullanıcı sayınıza göre esnek teklif
              </p>

              {/* Özellikler */}
              <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
                {[
                  'Profesyonel Plandaki Tüm MAYA Yetenekleri',
                  'Sınırsız Kullanıcı & Çoklu Şube Yönetimi',
                  'Tali Acente Prim ve Üretim Takip Modülü',
                  'Özel WhatsApp Business API & Kurumsal Numara',
                  'Acenteye Özel Maya AI İnce Ayar ve Eğitimi',
                  'Özel ERP ve Muhasebe Entegrasyonu',
                  'Kişisel Müşteri Başarı Temsilcisi (Dedicated Manager)',
                  'Özel Veri Taşıma & Yerinde Eğitim Danışmanlığı',
                  'Özel SLA & Kesintisizlik Taahhüdü',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <a
                href="tel:05376812840"
                className="w-full py-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Kurumsal Ekiple İletişime Geç (0537 681 28 40)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Görüşme ve demo için aynı gün geri dönüş
              </p>
            </div>
          </motion.div>

        </div>

        {/* Güven Logoları ve Rozetler */}
        <div className="mt-16 pt-10 border-t border-slate-200/90 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">KVKK Uyumlu Altyapı</div>
              <div className="text-xs text-slate-500 mt-1">6698 sayılı kanuna %100 tam uyumlu veri izolasyonu</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">256-bit Uçtan Uca SSL</div>
              <div className="text-xs text-slate-500 mt-1">Bankacılık standartlarında şifrelenmiş veri transferi</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                <Server className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Türkiye Sunucuları</div>
              <div className="text-xs text-slate-500 mt-1">Verileriniz Türkiye sınırları içindeki Tier-3 veri merkezindedir</div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default PricingSection;
