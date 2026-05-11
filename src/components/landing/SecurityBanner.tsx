"use client";

import { useScrollReveal } from "./useScrollReveal";

const BADGES = [
  "ISO 27001 Sertifikalı Altyapı",
  "256-Bit SSL Şifreleme",
  "KVKK %100 Uyumlu",
  "Düzenli Yedekleme",
  "Türkiye Sunucuları",
];

export default function SecurityBanner() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="guvenlik" className="lp-security">
      <div className="lp__container">
        <div
          ref={ref}
          className={`lp-reveal ${isVisible ? "lp-reveal--visible" : ""}`}
        >
          <h2 className="lp-security__title">%100 KVKK Uyumlu ve Güvenli</h2>
          <p className="lp-security__subtitle">
            Verileriniz Türkiye sunucularında, bankacılık standartlarında güvenlik
            protokolleri ile korunmaktadır.
          </p>
          <div className="lp-security__badges">
            {BADGES.map((badge) => (
              <span key={badge} className="lp-security__badge">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
