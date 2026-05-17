"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp__container">
        <div className="lp-footer__grid">
          {/* Brand */}
          <div className="lp-footer__brand">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.125rem", color: "var(--primary-900)" }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="10" fill="url(#footerLogoGrad)" />
                <path d="M16 7L9 10V17C9 20.87 12.13 24.5 16 25C19.87 24.5 23 20.87 23 17V10L16 7Z" fill="white" fillOpacity="0.9" />
                <path d="M13 16.5L15 18.5L19 14.5" stroke="url(#footerLogoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5A75F5" />
                    <stop offset="1" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>
              Sigorta Cüzdanı
            </div>
            <p>Şirketler için yeni nesil, akıllı poliçe ve risk yönetim platformu.</p>
          </div>

          {/* Platform */}
          <div className="lp-footer__col">
            <h4>Platform</h4>
            <a href="#ozellikler">Özellikler</a>
            <a href="#nasil-calisir">Nasıl Çalışır?</a>
            <a href="#guvenlik">Güvenlik</a>
          </div>

          {/* Hesap */}
          <div className="lp-footer__col">
            <h4>Hesap</h4>
            <Link href="/login">Giriş Yap</Link>
            <Link href="/demo/request">Demo Talep Et</Link>
          </div>

          {/* İletişim */}
          <div className="lp-footer__col">
            <h4>İletişim</h4>
            <a href="mailto:destek@sigortacuzdani.net">destek@sigortacuzdani.net</a>
            <a href="mailto:demo@sigortacuzdani.net">demo@sigortacuzdani.net</a>
          </div>
        </div>

        <div className="lp-footer__bottom">
          <p>© 2026 Sigorta Cüzdanı A.Ş. Tüm hakları saklıdır.</p>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/kvkk" style={{ color: "var(--text-tertiary)", transition: "color 150ms" }}>
              KVKK Politikası
            </Link>
            <Link href="/login" style={{ color: "var(--text-tertiary)", transition: "color 150ms" }}>
              Kullanım Koşulları
            </Link>
            <Link href="/login" style={{ color: "var(--text-tertiary)", transition: "color 150ms" }}>
              Gizlilik Politikası
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
