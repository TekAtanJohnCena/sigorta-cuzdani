'use client';

import React from 'react';
import { ArrowUp, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-50/80 text-slate-600 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center shrink-0">
                <img
                  src="/brand/logo.png"
                  alt="Sigorta Cüzdanı Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-slate-900 tracking-tight font-display">
                  Sigorta Cüzdanı
                </span>
                <span className="-mt-0.5 text-[11px] text-slate-500 font-medium">
                  Acente Portföy CRM'i & Maya AI
                </span>
              </div>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm max-w-sm leading-relaxed">
              Bağımsız sigorta acenteleri için portföy ve yenileme çalışma alanı. WhatsApp üzerinden proaktif çalışan yapay zekâ asistanı Maya ile tam kontrol.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Tüm Servisler Aktif • Tier-3 TR Veri Merkezi
            </div>
          </div>

          {/* Links 1 */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
              Maya Yetenekleri
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="#maya-whatsapp" className="hover:text-blue-600 transition">WhatsApp Vade Hatırlatma</a></li>
              <li><a href="#ozellikler" className="hover:text-blue-600 transition">Davranışsal Çapraz Satış</a></li>
              <li><a href="#ozellikler" className="hover:text-blue-600 transition">Churn / Müşteri Kayıp Analizi</a></li>
              <li><a href="#ozellikler" className="hover:text-blue-600 transition">Otomatik Büyüme Raporları</a></li>
              <li><a href="#dashboard" className="hover:text-blue-600 transition">Acente Yönetim Dashboard'u</a></li>
            </ul>
          </div>

          {/* Links 2: Kurumsal & Yasal Bağlantılar */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
              Kurumsal & Yasal
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="/iletisim" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">İletişim</a></li>
              <li><a href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">Mesafeli Satış Sözleşmesi</a></li>
              <li><a href="/iptal-ve-iade-kosullari" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">İptal ve İade Koşulları</a></li>
              <li><a href="/gizlilik-politikasi-kvkk" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">Gizlilik Politikası (KVKK)</a></li>
            </ul>
          </div>

          {/* Links 3: Gerçek İletişim Bilgileri */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
              İletişim
            </h4>
            <ul className="space-y-2.5 text-slate-500">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  Adnan Kahveci Mah. Ayfer Sok. No:15 Daire:8 Beylikdüzü / İstanbul
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a href="tel:05376812840" className="font-semibold text-slate-800 hover:text-blue-600 transition">
                  0537 681 28 40
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href="mailto:support@sigortacuzdani.net" className="hover:text-blue-600 transition">
                  support@sigortacuzdani.net
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href="mailto:info@sigortacuzdani.net" className="hover:text-blue-600 transition">
                  info@sigortacuzdani.net
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            &copy; 2026 Sigorta Cüzdanı. Tüm hakları saklıdır.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition cursor-pointer"
            >
              <span>Yukarı Çık</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
