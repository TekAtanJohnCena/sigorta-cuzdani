"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="lp-hero">
      {/* Animated background orbs */}
      <div className="lp-hero__bg" aria-hidden="true">
        <div className="lp-hero__orb--1" />
        <div className="lp-hero__orb--2" />
      </div>

      <div className="lp__container">
        <div className="lp-hero__grid">
          {/* Left: Text content */}
          <div className="lp-hero__text">
            <div className="lp-hero__badge">
              <span className="lp-hero__stars">★★★★★</span>
              Türkiye&apos;nin Yeni Nesil Poliçe Yönetim Sistemi
            </div>
            <h1 className="lp-hero__title">
              Kurumsal Sigorta Süreçlerinizi{" "}
              <span>Tek Panelde Toplayın</span>
            </h1>
            <p className="lp-hero__subtitle">
              Excel tablolarına ve manuel takiplere son verin. Platformumuz ile
              poliçelerinizi otomatik sisteme aktarın, vade günlerini kaçırmayın
              ve kurumsal risklerinizi %40 oranında azaltın.
            </p>
            <div className="lp-hero__cta">
              <Link href="/demo/request" className="btn btn-primary btn-lg">
                Demo Talep Et
              </Link>
              {user && (
                <Link href="/dashboard" className="btn btn-secondary btn-lg">
                  Dashboard&apos;a Git →
                </Link>
              )}
            </div>
            <div className="lp-hero__features">
              <span>✓ KVKK Uyumlu</span>
              <span>✓ PDF & Tarama Analizi</span>
              <span>✓ 7/24 Destek</span>
            </div>
          </div>

          {/* Right: Dashboard mock-up */}
          <div className="lp-hero__visual">
            <div className="lp-mockup">
              {/* Window chrome */}
              <div className="lp-mockup__header">
                <div className="lp-mockup__dots">
                  <span /><span /><span />
                </div>
                <div style={{ marginLeft: 16, background: "var(--neutral-100)", padding: "4px 12px", borderRadius: 6, fontSize: "0.75rem", color: "var(--text-tertiary)", flex: 1, textAlign: "center" }}>
                  sigortacuzdani.net/dashboard
                </div>
              </div>
              {/* App body */}
              <div className="lp-mockup__body">
                <div className="lp-mockup__sidebar">
                  <div className="lp-mockup__sidebar-icon lp-mockup__sidebar-icon--active" />
                  <div className="lp-mockup__sidebar-icon" />
                  <div className="lp-mockup__sidebar-icon" />
                  <div className="lp-mockup__sidebar-icon" />
                </div>
                <div className="lp-mockup__content">
                  {/* Stats row */}
                  <div className="lp-mockup__stats">
                    <div className="lp-mockup__stat-box" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "12px 16px" }}>
                      <span style={{ fontSize: "0.625rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Aktif Poliçe</span>
                      <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-900)" }}>24</span>
                    </div>
                    <div className="lp-mockup__stat-box" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "12px 16px", background: "var(--danger-50)", borderColor: "var(--danger-100)" }}>
                      <span style={{ fontSize: "0.625rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Vadesi Yaklaşan</span>
                      <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--danger-600)" }}>3</span>
                    </div>
                    <div className="lp-mockup__stat-box" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "12px 16px" }}>
                      <span style={{ fontSize: "0.625rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Toplam Prim</span>
                      <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary-900)" }}>₺142.5K</span>
                    </div>
                  </div>
                  {/* Table */}
                  <div className="lp-mockup__table">
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", padding: "8px 12px", borderBottom: "1px solid var(--border-light)", fontSize: "0.5625rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-tertiary)", background: "var(--neutral-50)" }}>
                      <span>Poliçe Tipi</span><span>Şirket</span><span>Bitiş</span><span>Durum</span>
                    </div>
                    {[
                      { type: "🚗 Kasko", firm: "Allianz", date: "12.05.2026", status: "Ödeme Bekliyor", color: "var(--warning-600)", bg: "var(--warning-50)" },
                      { type: "🏥 Sağlık", firm: "Anadolu", date: "24.08.2026", status: "Aktif", color: "var(--success-700)", bg: "var(--success-50)" },
                      { type: "🏢 İşyeri", firm: "AXA", date: "01.11.2026", status: "Aktif", color: "var(--success-700)", bg: "var(--success-50)" },
                    ].map((row) => (
                      <div key={row.type} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", padding: "10px 12px", borderBottom: "1px solid var(--border-light)", fontSize: "0.6875rem", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, color: "var(--primary-900)" }}>{row.type}</span>
                        <span style={{ color: "var(--text-secondary)" }}>{row.firm}</span>
                        <span style={{ color: "var(--text-secondary)" }}>{row.date}</span>
                        <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: "0.5625rem", fontWeight: 700, background: row.bg, color: row.color, width: "fit-content" }}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
