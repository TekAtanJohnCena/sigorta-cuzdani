'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, ShieldCheck, Zap } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export const MetricsSection: React.FC = () => {
  const metrics = [
    {
      id: 1,
      value: 35,
      prefix: '%',
      suffix: '',
      title: 'Yenileme Artışı',
      subtitle: "Maya'nın WhatsApp otomasyonu ile",
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      id: 2,
      value: 12,
      prefix: '',
      suffix: ' Saat',
      title: 'Haftalık Tasarruf',
      subtitle: 'Manuel takip yerine otomasyonla',
      icon: Clock,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      id: 3,
      value: 28,
      prefix: '%',
      suffix: '',
      title: 'Çapraz Satış Artışı',
      subtitle: 'Nokta atışı müşteri analizleriyle',
      icon: Target,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-100',
    },
  ];

  return (
    <section id="sonuclar" className="py-24 sm:py-32 relative bg-white border-t border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Başlık */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-800 shadow-sm mb-4">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">SOMUT KAZANIMLAR</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Gerçek Sonuçlar, Ölçülebilir Değer
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Maya'yı kullanan bağımsız sigorta acentelerinin 3 aylık kullanım sonrası elde ettiği gerçek veriler.
          </p>
        </div>

        {/* 3 Büyük Sayı Kartı (AnimatedCounter) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.id}
                className="relative rounded-3xl bg-slate-50/70 border border-slate-200/90 p-8 text-center hover:border-blue-300 hover:bg-white hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={`w-14 h-14 rounded-2xl ${m.iconBg} ${m.iconColor} flex items-center justify-center mx-auto mb-5 shadow-xs transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Büyük Sayı */}
                <div className="text-5xl sm:text-6xl font-black text-slate-900 font-display tracking-tight">
                  <AnimatedCounter
                    value={m.value}
                    prefix={m.prefix}
                    suffix={m.suffix}
                    duration={1800}
                  />
                </div>

                <div className="text-lg font-bold text-slate-900 mt-2">
                  {m.title}
                </div>

                <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  {m.subtitle}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Metodoloji Kutusu */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                Örnek Acente Senaryosu: 100 Müşterili Portföy
              </h4>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                100 müşterisi olan ortalama bir bağımsız acente; vadeleri Excel'de tek tek aramak yerine Maya'nın WhatsApp onay akışını kullanarak <b>haftada 12 saat</b> operasyonel iş gücünden tasarruf eder ve kaçak poliçelerini kurtararak <b>yıllık ortalama %35 ek prim üretimi</b> sağlar.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MetricsSection;
