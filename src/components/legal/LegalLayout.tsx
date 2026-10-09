'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  Mail, 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Lock,
  ChevronRight
} from 'lucide-react';
import Footer from '@/components/landing/Footer';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  badge?: string;
  children: React.ReactNode;
}

const navItems = [
  {
    name: 'İletişim & Kurumsal',
    href: '/iletisim',
    icon: Mail,
    desc: 'Şirket bilgileri ve destek kanalları'
  },
  {
    name: 'Mesafeli Satış Sözleşmesi',
    href: '/mesafeli-satis-sozlesmesi',
    icon: FileText,
    desc: 'Hizmet ve lisans şartları'
  },
  {
    name: 'İptal ve İade Koşulları',
    href: '/iptal-ve-iade-kosullari',
    icon: RotateCcw,
    desc: 'Abonelik iptali ve cayma hakları'
  },
  {
    name: 'Gizlilik Politikası (KVKK)',
    href: '/gizlilik-politikasi-kvkk',
    icon: ShieldCheck,
    desc: 'Kişisel veriler ve yapay zekâ işleme'
  },
];

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated = 'Ekim 2026',
  badge = 'Resmi Hukuki Metin',
  children,
}) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-amber-500/20 selection:text-amber-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ana Sayfaya Dön</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 flex items-center justify-center shrink-0">
                <img
                  src="/brand/logo.png"
                  alt="Sigorta Cüzdanı Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 font-display flex items-center gap-1.5">
                  Sigorta Cüzdanı
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    MAYA 🐝
                  </span>
                </span>
                <span className="-mt-0.5 text-[10px] text-slate-500 font-medium">
                  Yasal & Kurumsal Bilgi Merkezi
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              Giriş Yap
            </Link>
            <Link
              href="/"
              className="text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1.5 rounded-full shadow-sm hover:from-amber-600 hover:to-amber-700 transition"
            >
              14 Gün Ücretsiz Dene
            </Link>
          </div>
        </div>
      </header>

      {/* Page Title Hero Banner */}
      <div className="bg-gradient-to-b from-white to-slate-100/70 border-b border-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
            <Link href="/" className="hover:text-slate-900">Ana Sayfa</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">Kurumsal & Hukuk</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-amber-700 font-semibold">{title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-2.5">
                <Lock className="w-3 h-3 text-amber-600" />
                {badge}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                {title}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="text-xs text-slate-500 shrink-0 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-xs">
              <span className="font-semibold text-slate-700">Son Güncelleme: </span>
              {lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Navigation Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs sticky top-24">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 font-mono">
                Belgeler ve Sayfalar
              </h2>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-amber-50/80 text-amber-950 font-medium border border-amber-200/80 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm ${isActive ? 'font-bold text-slate-900' : 'font-semibold'}`}>
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {item.desc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Verified Company Box */}
              <div className="mt-6 pt-5 border-t border-slate-100 px-2 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Resmi İşletme Bilgileri</span>
                </div>
                
                <div className="text-[11px] text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-mono">
                  <div>
                    <span className="text-slate-400">Ünvan:</span> <span className="font-semibold text-slate-800">EMRE ERCAN</span> (Şahıs Şirketi)
                  </div>
                  <div>
                    <span className="text-slate-400">V.D.:</span> <span className="font-semibold text-slate-800">Büyükçekmece V.D.</span>
                  </div>
                  <div>
                    <span className="text-slate-400">VKN/TCKN:</span> <span className="font-semibold text-slate-800">3400371057</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Adnan Kahveci Mah. Ayfer Sok. No:15 Daire:8 Beylikdüzü / İstanbul</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">0537 681 28 40</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>KVKK Uyumlu Güvenli Bulut Altyapısı</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Document Content Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
              {children}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LegalLayout;
