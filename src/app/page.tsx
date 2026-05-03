"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useEffect, useState } from "react";
import "./landing.css"; // We'll add some specific CSS here if needed, or rely on globals

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "var(--text-tertiary)" }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="landing-layout">
      {/* HEADER / NAVIGATION */}
      <header className={`landing-header ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-container header-content">
          <div className="logo-area">
            <div className="logo-icon">🛡️</div>
            <span className="logo-text">Sigorta Cüzdanı</span>
          </div>

          <nav className="desktop-nav">
            <a href="#ozellikler">Özellikler</a>
            <a href="#nasil-calisir">Nasıl Çalışır?</a>
            <a href="#guvenlik">Güvenlik</a>
          </nav>

          <div className="header-actions">
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

      <main>
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="landing-container hero-grid">
            <div className="hero-text">
              <div className="trust-badge">
                <span className="stars">★★★★★</span>
                Türkiye&apos;nin Yeni Nesil Poliçe Yönetim Sistemi
              </div>
              <h1 className="hero-title">
                Kurumsal Sigorta Süreçlerinizi <span>Tek Panelde</span> Toplayın
              </h1>
              <p className="hero-subtitle">
                Excel tablolarına ve manuel takiplere son verin. Platformumuz ile poliçelerinizi otomatik sisteme aktarın, vade günlerini kaçırmayın ve kurumsal risklerinizi %40 oranında azaltın.
              </p>
              <div className="hero-cta">
                <Link href="/demo/request" className="btn btn-primary btn-lg">
                  Demo Talep Et
                </Link>
                {user && (
                  <Link href="/dashboard" className="btn btn-secondary btn-lg" style={{ background: "transparent", border: "1px solid var(--border-medium)", color: "var(--text-secondary)" }}>
                    Dashboard&apos;a Git →
                  </Link>
                )}
              </div>
              <div className="hero-features-list">
                <span>✓ KVKK Uyumlu</span>
                <span>✓ Dijital & Taranmış PDF Analizi</span>
                <span>✓ 7/24 Destek</span>
              </div>
            </div>

            <div className="hero-image-wrapper">
              <div className="dashboard-preview-card">
                <div className="preview-header">
                  <div className="window-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div className="window-title">sigortacuzdani.net/dashboard</div>
                </div>
                <div className="preview-body">
                  <div className="preview-sidebar">
                    <div className="ps-icon active"></div>
                    <div className="ps-icon"></div>
                    <div className="ps-icon"></div>
                  </div>
                  <div className="preview-content">
                    <div className="preview-stats">
                      <div className="p-stat">
                        <span className="ps-title">Aktif Poliçe</span>
                        <span className="ps-val">24</span>
                      </div>
                      <div className="p-stat p-stat-red">
                        <span className="ps-title">Vadesi Yaklaşan</span>
                        <span className="ps-val" style={{ color: "var(--danger-600)" }}>3</span>
                      </div>
                      <div className="p-stat">
                        <span className="ps-title">Toplam Prim</span>
                        <span className="ps-val">₺142.500</span>
                      </div>
                    </div>
                    <div className="preview-table">
                      <div className="p-table-header">
                        <span>Poliçe Tipi</span>
                        <span>Şirket</span>
                        <span>Bitiş Tarihi</span>
                        <span>Durum</span>
                      </div>
                      <div className="p-row">
                        <span className="pr-type">🚗 Kasko</span>
                        <span>Allianz</span>
                        <span>12.05.2026</span>
                        <span className="pr-status pr-warning">Ödeme Bekliyor</span>
                      </div>
                      <div className="p-row">
                        <span className="pr-type">🏥 Sağlık</span>
                        <span>Anadolu</span>
                        <span>24.08.2026</span>
                        <span className="pr-status pr-active">Aktif</span>
                      </div>
                      <div className="p-row">
                        <span className="pr-type">🏢 İşyeri</span>
                        <span>Axa</span>
                        <span>01.11.2026</span>
                        <span className="pr-status pr-active">Aktif</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION (Outcome-oriented) */}
        <section id="ozellikler" className="features-section">
          <div className="landing-container">
            <div className="section-header">
              <h2>Her Adım Kontrol Altında</h2>
              <p>Karmaşık poliçe yönetimini saniyeler süren, görünür, hatalara kapalı akıllı bir iş akışına dönüştürün.</p>
            </div>

            <div className="features-grid">
              <div className="f-card">
                <div className="f-icon">⚡</div>
                <h3>Anlık Veri Aktarımı</h3>
                <p>Poliçe PDF&apos;lerinizi sisteme yüklediğiniz anda akıllı asistanımız tüm verileri (şirket, prim, vadeler, şartlar) saniyeler içinde ayrıştırır ve yapılandırır.</p>
              </div>
              <div className="f-card">
                <div className="f-icon">🔔</div>
                <h3>Erken Uyarı Sistemi</h3>
                <p>Vadesi yaklaşan poliçeleriniz için 30 gün önceden otomatik e-posta ve SMS uyarıları ile riskinizi sıfırlayın.</p>
              </div>
              <div className="f-card">
                <div className="f-icon">📊</div>
                <h3>Gelişmiş Raporlama</h3>
                <p>Tüm şirketlerinize, şubelerinize ve birimlerinize ait prim bütçelerini gerçek zamanlı dashboard üzerinden anlık olarak analiz edin.</p>
              </div>
              <div className="f-card">
                <div className="f-icon">🔒</div>
                <h3>BankaSınıfı Güvenlik</h3>
                <p>Orijinal belgeleriniz 256-bit şifreleme ile bulut sistemimizde izole olarak saklanır, 99.9% Uptime garantisi verilir.</p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS / DEMO */}
        <section id="nasil-calisir" className="how-it-works-section">
          <div className="landing-container">
            <div className="hiw-grid">
              <div className="hiw-content">
                <h2>Dakikalar İçinde Kurulum</h2>
                <p>Mevcut düzeninizi bozmadan platforma geçiş yapın. Özel entegrasyon veya uzun eğitimlere ihtiyacınız yok.</p>

                <div className="steps-list">
                  <div className="step-item">
                    <div className="step-num">1</div>
                    <div>
                      <h4>Demo Talep Edin</h4>
                      <p>Formu doldurun, ekibimiz sizinle iletişime geçsin ve şirketinize özel kurulumunuzu başlatsın.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">2</div>
                    <div>
                      <h4>Poliçelerinizi Yükleyin</h4>
                      <p>Mevcut poliçe PDF veya CSV dosyalarınızı sisteme sürükleyip bırakın. Sistem verileri otomatik aykılasın.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">3</div>
                    <div>
                      <h4>İzleyin ve Karar Verin</h4>
                      <p>Tüm finansal akışınız, aktif teminatlarınız ve yaklaşan yenilemeleriniz artık tek bir panelde.</p>
                    </div>
                  </div>
                </div>

                <Link href="/demo/request" className="btn btn-primary" style={{ marginTop: "var(--space-6)" }}>Demo Talep Edin</Link>
              </div>
              <div className="hiw-image">
                {/* Visual box representing clean UI */}
                <div className="ui-placeholder">
                  <div className="ui-header-fake">Poliçe PDF Analizi</div>
                  <div className="ui-dropzone-fake">
                    📄 PDF Dosyasını Buraya Sürükleyin
                  </div>
                  <div className="ui-row-fake">Analiz ediliyor: Trafik_Policesi.pdf %98</div>
                  <div className="ui-row-fake">Başarıyla eklendi: Allianz_Kasko.pdf</div>
                  <div className="ui-row-fake">Başarıyla eklendi: AXA_Konut.pdf</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY / TRUST */}
        <section id="guvenlik" className="security-section">
          <div className="landing-container text-center">
            <h2>%100 KVKK Uyumlu ve Güvenli</h2>
            <p className="sec-subtitle">Verileriniz Türkiye sunucularında, bankacılık standartlarında güvenlik protokolleri ile korunmaktadır.</p>
            <div className="sec-badges">
              <span className="badge badge-gray">ISO 27001 Sertifikalı Altyapı</span>
              <span className="badge badge-gray">256-Bit SSL</span>
              <span className="badge badge-gray">Düzenli Yedekleme</span>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="bottom-cta-section">
          <div className="landing-container">
            <div className="cta-box">
              <h2>İşletmenizin Risklerini Şansa Bırakmayın</h2>
              <p>Platformumuzu yakından görmek için bir demo toplantısı talep edin. Şirketinizin ihtiyaçlarına özel kurulum ve eğitim desteği veriyoruz.</p>
              <div className="cta-actions">
                <Link href="/demo/request" className="btn btn-primary btn-lg" style={{ background: "white", color: "var(--primary-600)" }}>
                  Demo Toplantısı Planlayın
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-grid">
            <div className="f-col">
              <div className="logo-area" style={{ marginBottom: "var(--space-4)" }}>
                <div className="logo-icon">🛡️</div>
                <span className="logo-text">Sigorta Cüzdanı</span>
              </div>
              <p style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                Şirketler için yeni nesil, akıllı poliçe ve risk yönetim platformu.
              </p>
            </div>

            <div className="f-col">
              <h4>Platform</h4>
              <a href="#ozellikler">Özellikler</a>
              <a href="#nasil-calisir">Nasıl Çalışır?</a>
              <a href="#guvenlik">Güvenlik</a>
            </div>

            <div className="f-col">
              <h4>Hesap</h4>
              <Link href="/login">Giriş Yap</Link>
              <Link href="/demo/request">Demo Talep Et</Link>
            </div>

            <div className="f-col">
              <h4>İletişim</h4>
              <a href="mailto:destek@sigortacuzdani.net">destek@sigortacuzdani.net</a>
              <a href="mailto:demo@sigortacuzdani.net">demo@sigortacuzdani.net</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Sigorta Cüzdanı A.Ş. Tüm hakları saklıdır.</p>
            <div className="footer-legal">
              <Link href="/login">Kullanım Koşulları</Link>
              <Link href="/login">Gizlilik Politikası</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
