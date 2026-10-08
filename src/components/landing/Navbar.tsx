'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import MayaAvatar from './MayaAvatar';

interface NavbarProps {
  onOpenTrial: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTrial }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-700 text-white py-1.5 px-4 text-center text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
            YENİ
          </span>
          <span>Acentenizin ilk yapay zekâ çalışanı <b>MAYA 🐝</b> göreve hazır!</span>
          <button
            onClick={onOpenTrial}
            className="underline underline-offset-2 hover:text-amber-100 font-semibold ml-1 cursor-pointer"
          >
            Hemen Dene →
          </button>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <nav
          className={`flex items-center justify-between rounded-full border px-5 py-2.5 transition-all duration-300 ${
            scrolled
              ? 'border-slate-200/90 bg-white/95 shadow-lg shadow-slate-900/5 backdrop-blur-md'
              : 'border-slate-200/60 bg-white/80 shadow-xs backdrop-blur-sm'
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="h-9 w-9 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/brand/logo.png"
                alt="Sigorta Cüzdanı Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 font-display flex items-center gap-1.5">
                Sigorta Cüzdanı
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  MAYA 🐝
                </span>
              </span>
              <span className="-mt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-500">
                Acente Portföy Yönetimi
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <a
              href="#maya-whatsapp"
              className="px-3.5 py-1.5 rounded-full hover:text-amber-600 hover:bg-slate-100/80 transition flex items-center gap-1.5"
            >
              <MayaAvatar size="xs" showGlow={false} />
              <span>Maya Nasıl Çalışır?</span>
            </a>
            <a
              href="#ozellikler"
              className="px-3.5 py-1.5 rounded-full hover:text-amber-600 hover:bg-slate-100/80 transition"
            >
              Özellikler
            </a>
            <a
              href="#dashboard"
              className="px-3.5 py-1.5 rounded-full hover:text-amber-600 hover:bg-slate-100/80 transition"
            >
              Dashboard
            </a>
            <a
              href="#sonuclar"
              className="px-3.5 py-1.5 rounded-full hover:text-amber-600 hover:bg-slate-100/80 transition"
            >
              Sonuçlar
            </a>
            <a
              href="#fiyatlandirma"
              className="px-3.5 py-1.5 rounded-full hover:text-amber-600 hover:bg-slate-100/80 transition"
            >
              Fiyat
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <a
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition cursor-pointer"
            >
              Giriş Yap
            </a>
            <button
              onClick={onOpenTrial}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-amber-700 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <span>14 Gün Ücretsiz Dene</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md space-y-2">
            <a
              href="#maya-whatsapp"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <MayaAvatar size="xs" />
              <span>Maya Nasıl Çalışır?</span>
            </a>
            <a
              href="#ozellikler"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Özellikler
            </a>
            <a
              href="#dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Dashboard
            </a>
            <a
              href="#sonuclar"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Sonuçlar
            </a>
            <a
              href="#fiyatlandirma"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Fiyat
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrial();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm text-center cursor-pointer"
              >
                14 Gün Ücretsiz Başla
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
