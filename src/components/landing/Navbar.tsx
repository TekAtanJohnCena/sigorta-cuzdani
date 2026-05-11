"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`lp-navbar ${scrolled ? "lp-navbar--scrolled" : ""}`}>
      <div className="lp__container lp-navbar__content">
        {/* Logo */}
        <Link href="/" className="lp-navbar__logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="url(#navLogoGrad)" />
            {/* Shield */}
            <path d="M16 7L9 10V17C9 20.87 12.13 24.5 16 25C19.87 24.5 23 20.87 23 17V10L16 7Z" fill="white" fillOpacity="0.9" />
            {/* Checkmark inside shield */}
            <path d="M13 16.5L15 18.5L19 14.5" stroke="url(#navLogoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="navLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5A75F5" />
                <stop offset="1" stopColor="#14B8A6" />
              </linearGradient>
            </defs>
          </svg>
          Sigorta Cüzdanı
        </Link>

        {/* Desktop Nav */}
        <nav className="lp-navbar__nav">
          <a href="#ozellikler" className="lp-navbar__nav-link">Özellikler</a>
          <a href="#nasil-calisir" className="lp-navbar__nav-link">Nasıl Çalışır?</a>
          <a href="#guvenlik" className="lp-navbar__nav-link">Güvenlik</a>
        </nav>

        {/* Actions */}
        <div className="lp-navbar__actions">
          {user ? (
            <Link href="/dashboard" className="btn btn-primary">
              Dashboard&apos;a Dön →
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Giriş Yap
              </Link>
              <Link href="/demo/request" className="btn btn-primary">
                Demo Talep Et
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
