"use client";

import Link from "next/link";
import { useScrollReveal } from "./useScrollReveal";

const PLANS = [
  {
    name: "Starter",
    desc: "Küçük işletmeler için temel poliçe yönetimi",
    price: "1.490",
    period: "/ay",
    features: [
      "50 poliçeye kadar",
      "3 kullanıcı",
      "AI poliçe analizi",
      "Vade takibi & uyarılar",
      "E-posta bildirimleri",
      "PDF dışa aktarım",
    ],
    cta: "Demo Talep Et",
    highlight: false,
  },
  {
    name: "Business",
    desc: "Orta ölçekli şirketler ve acenteler için",
    price: "3.990",
    period: "/ay",
    features: [
      "Sınırsız poliçe",
      "10 kullanıcı",
      "AI risk gap analizi",
      "Teminat karşılaştırma",
      "Haftalık özet raporu",
      "CSV/PDF dışa aktarım",
      "Öncelikli destek",
    ],
    cta: "Demo Talep Et",
    highlight: true,
  },
  {
    name: "Enterprise",
    desc: "Büyük şirketler ve sigorta şirketleri için",
    price: "Özel",
    period: "",
    features: [
      "Sınırsız her şey",
      "Sınırsız kullanıcı",
      "API erişimi",
      "SSO (Azure AD / Google)",
      "Departman bazlı erişim",
      "SLA garantisi",
      "Özel entegrasyon",
      "Dedike hesap yöneticisi",
    ],
    cta: "İletişime Geçin",
    highlight: false,
  },
];

export default function PricingSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="fiyatlandirma" className="lp-pricing">
      <div className="lp__container">
        <div
          ref={ref}
          className={`lp-reveal ${isVisible ? "lp-reveal--visible" : ""}`}
        >
          <h2 className="lp-pricing__title">Şeffaf Fiyatlandırma</h2>
          <p className="lp-pricing__subtitle">
            Her ölçekte işletmeye uygun planlar. Gizli maliyet yok.
          </p>

          <div className="lp-pricing__grid">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`lp-pricing__card ${plan.highlight ? "lp-pricing__card--highlight" : ""}`}
              >
                {plan.highlight && (
                  <div className="lp-pricing__badge">En Popüler</div>
                )}
                <div className="lp-pricing__plan-name">{plan.name}</div>
                <div className="lp-pricing__plan-desc">{plan.desc}</div>
                <div className="lp-pricing__price">
                  {plan.price === "Özel" ? (
                    <span className="lp-pricing__price-custom">Özel Fiyat</span>
                  ) : (
                    <>
                      <span className="lp-pricing__price-currency">₺</span>
                      <span className="lp-pricing__price-amount">{plan.price}</span>
                      <span className="lp-pricing__price-period">{plan.period}</span>
                    </>
                  )}
                </div>
                <ul className="lp-pricing__features">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link
                  href="/demo/request"
                  className={`btn ${plan.highlight ? "btn-primary" : "btn-secondary"} btn-lg`}
                  style={{ width: "100%", textAlign: "center" }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="lp-pricing__note">
            Tüm fiyatlar KDV hariçtir. Yıllık ödemede %20 indirim uygulanır.
          </p>
        </div>
      </div>
    </section>
  );
}
