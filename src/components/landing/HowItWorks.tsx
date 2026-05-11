"use client";

import Link from "next/link";
import { useScrollReveal } from "./useScrollReveal";

const STEPS = [
  {
    num: "1",
    title: "Demo Talep Edin",
    desc: "Formu doldurun, ekibimiz sizinle iletişime geçsin ve şirketinize özel kurulumunuzu birlikte başlatalım.",
    visual: (
      <div className="lp-hiw__visual">
        <div style={{ padding: "16px", background: "var(--primary-50)", borderRadius: "12px", border: "1px solid var(--primary-100)", marginBottom: "12px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase" }}>Demo Talebi</div>
          <div style={{ height: "10px", borderRadius: "4px", background: "var(--primary-200)", marginBottom: "8px" }} />
          <div style={{ height: "10px", borderRadius: "4px", background: "var(--primary-100)", width: "70%" }} />
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.875rem", color: "var(--success-700)" }}>
          <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--success-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>✓</span>
          Talebiniz alındı — 24 saat içinde dönüş sağlanır
        </div>
      </div>
    ),
  },
  {
    num: "2",
    title: "Poliçelerinizi Yükleyin",
    desc: "Mevcut poliçe PDF veya CSV dosyalarınızı sisteme sürükleyip bırakın. Yapay zeka motorumuz verileri saniyeler içinde analiz eder.",
    visual: (
      <div className="lp-hiw__visual" style={{ border: "2px dashed var(--primary-300)", background: "var(--primary-50)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <div style={{ fontSize: "2rem" }}>📄</div>
        <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--primary-700)" }}>PDF Dosyanızı Buraya Sürükleyin</div>
        <div style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>veya dosya seçin</div>
      </div>
    ),
  },
  {
    num: "3",
    title: "İzleyin ve Karar Verin",
    desc: "Tüm finansal akışınız, aktif teminatlarınız ve yaklaşan yenilemeleriniz artık tek bir panelde, gerçek zamanlı olarak önünüzde.",
    visual: (
      <div className="lp-hiw__visual" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[
          { label: "Risk Skoru", value: "92 / 100", color: "var(--success-600)" },
          { label: "Açık Risk", value: "0 Teminat Boşluğu", color: "var(--success-600)" },
          { label: "Yaklaşan Yenileme", value: "3 Poliçe — 30 gün içinde", color: "var(--warning-600)" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function HowItWorks() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  return (
    <section id="nasil-calisir" className="lp-hiw">
      <div className="lp__container">
        <div className={`lp-section-header lp-reveal ${headerVisible ? "lp-reveal--visible" : ""}`} ref={headerRef}>
          <h2 className="lp-section-title">Dakikalar İçinde Kurulum</h2>
          <p className="lp-section-subtitle">
            Mevcut düzeninizi bozmadan platforma geçiş yapın. Özel entegrasyon veya uzun eğitimlere ihtiyacınız yok.
          </p>
        </div>

        <div className="lp-hiw__grid">
          {/* Left: sticky step indicators */}
          <div className="lp-hiw__left">
            <div className="steps-list" style={{ display: "flex", flexDirection: "column", gap: "32px", marginBottom: "40px" }}>
              {STEPS.map((step) => (
                <div key={step.num} className="lp-step">
                  <div className="lp-step__num">{step.num}</div>
                  <div className="lp-step__content">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/demo/request" className="btn btn-primary btn-lg">
              Demo Talep Edin
            </Link>
          </div>

          {/* Right: visuals */}
          <div className="lp-hiw__right">
            {STEPS.map((step, i) => (
              <StepVisual key={i} visual={step.visual} delay={i * 100} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepVisual({ visual, delay }: { visual: React.ReactNode; delay: number }) {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`lp-reveal ${isVisible ? "lp-reveal--visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {visual}
    </div>
  );
}
