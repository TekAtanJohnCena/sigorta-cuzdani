"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield } from "lucide-react";

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
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-900)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} strokeWidth={1.5} color="white" />
            </div>
            Sigorta Cüzdanı
          </Link>

          <nav className="lp-navbar__nav">
            <a href="#ozellikler" className="lp-navbar__nav-link">Özellikler</a>
            <a href="#nasil-calisir" className="lp-navbar__nav-link">Nasıl Çalışır?</a>
            <a href="#guvenlik" className="lp-navbar__nav-link">Güvenlik</a>
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
