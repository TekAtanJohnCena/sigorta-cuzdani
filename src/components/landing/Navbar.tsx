"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <motion.header
        className={`lp-navbar ${scrolled ? "lp-navbar--scrolled" : ""}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="lp__container lp-navbar__content">
          <Link href="/" className="lp-navbar__logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--primary-900)" />
              <path d="M16 7L9 10V17C9 20.87 12.13 24.5 16 25C19.87 24.5 23 20.87 23 17V10L16 7Z" fill="white" fillOpacity="0.9" />
              <path d="M13 16.5L15 18.5L19 14.5" stroke="var(--primary-900)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sigorta Cüzdanı
          </Link>

          <nav className="lp-navbar__nav">
            <a href="#ozellikler" className="lp-navbar__nav-link">Özellikler</a>
            <a href="#nasil-calisir" className="lp-navbar__nav-link">Nasıl Çalışır?</a>
            <a href="#guvenlik" className="lp-navbar__nav-link">Güvenlik</a>
            <a href="#fiyatlandirma" className="lp-navbar__nav-link">Fiyatlandırma</a>
          </nav>

          <div className="lp-navbar__actions">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">
                Dashboard&apos;a Dön
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
            <button
              className="lp-navbar__mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menüyü Aç"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="lp-navbar__mobile-overlay lp-navbar__mobile-overlay--visible"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
            />
            <motion.div
              className="lp-navbar__mobile-menu lp-navbar__mobile-menu--open"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                className="lp-navbar__mobile-close"
                onClick={closeMobileMenu}
                aria-label="Menüyü Kapat"
              >
                <X size={20} strokeWidth={1.5} />
              </button>

              <a href="#ozellikler" className="lp-navbar__mobile-link" onClick={closeMobileMenu}>Özellikler</a>
              <a href="#nasil-calisir" className="lp-navbar__mobile-link" onClick={closeMobileMenu}>Nasıl Çalışır?</a>
              <a href="#guvenlik" className="lp-navbar__mobile-link" onClick={closeMobileMenu}>Güvenlik</a>
              <a href="#fiyatlandirma" className="lp-navbar__mobile-link" onClick={closeMobileMenu}>Fiyatlandırma</a>

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {user ? (
                  <Link href="/dashboard" className="btn btn-primary" onClick={closeMobileMenu}>
                    Dashboard&apos;a Dön
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="btn btn-ghost" onClick={closeMobileMenu}>Giriş Yap</Link>
                    <Link href="/demo/request" className="btn btn-primary" onClick={closeMobileMenu}>Demo Talep Et</Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
