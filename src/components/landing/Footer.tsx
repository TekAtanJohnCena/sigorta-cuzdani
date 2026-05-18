"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      className="lp-footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="lp__container">
        <div className="lp-footer__grid">
          <div className="lp-footer__brand">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.125rem", color: "var(--primary-900)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--primary-900)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={16} strokeWidth={1.5} color="white" />
              </div>
              Sigorta Cüzdanı
            </div>
            <p>Şirketler için yeni nesil, akıllı poliçe ve risk yönetim platformu.</p>
          </div>

          <div className="lp-footer__col">
            <h4>Platform</h4>
            <a href="#ozellikler">Özellikler</a>
            <a href="#nasil-calisir">Nasıl Çalışır?</a>
            <a href="#guvenlik">Güvenlik</a>
          </div>

          <div className="lp-footer__col">
            <h4>Hesap</h4>
            <Link href="/login">Giriş Yap</Link>
            <Link href="/demo/request">Demo Talep Et</Link>
          </div>

          <div className="lp-footer__col">
            <h4>İletişim</h4>
            <a href="mailto:destek@sigortacuzdani.net">destek@sigortacuzdani.net</a>
            <a href="mailto:demo@sigortacuzdani.net">demo@sigortacuzdani.net</a>
          </div>
        </div>

        <div className="lp-footer__bottom">
          <p>&copy; 2026 Sigorta Cüzdanı A.Ş. Tüm hakları saklıdır.</p>
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
    </motion.footer>
  );
}
