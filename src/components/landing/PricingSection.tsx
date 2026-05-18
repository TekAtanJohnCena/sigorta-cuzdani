"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Başlangıç",
    desc: "Küçük işletmeler için temel poliçe yönetimi",
    price: "₺1.490",
    period: "/ay",
    features: [
      "10 poliçe kaydı",
      "1 kullanıcı",
      "Vade takip uyarıları",
      "PDF yükleme & analiz",
      "Temel raporlama",
      "E-posta desteği",
    ],
    cta: "Demo Talep Et",
    href: "/demo/request",
    highlighted: false,
  },
  {
    name: "Business",
    desc: "Büyüyen şirketler için tam kapsamlı platform",
    price: "₺3.990",
    period: "/ay",
    features: [
      "Sınırsız poliçe",
      "Sınırsız kullanıcı",
      "AI destekli risk analizi",
      "Gelişmiş raporlama & dashboard",
      "Çok kullanıcılı yetki yönetimi",
      "Öncelikli destek & özel eğitim",
    ],
    cta: "Demo Talep Et",
    href: "/demo/request",
    highlighted: true,
  },
  {
    name: "Enterprise",
    desc: "Holding ve büyük kurumlara özel çözümler",
    price: "Özel Fiyat",
    period: "",
    features: [
      "Business planındaki her şey",
      "Özel API entegrasyonu",
      "Dedicated hesap yöneticisi",
      "SLA garantisi",
      "On-premise kurulum seçeneği",
      "Özel güvenlik denetimi",
    ],
    cta: "İletişime Geçin",
    href: "mailto:demo@sigortacuzdani.net",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section id="fiyatlandirma" className="lp-pricing">
      <div className="lp__container">
        <motion.div
          className="lp-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <h2 className="lp-section-title">Basit ve Şeffaf Fiyatlandırma</h2>
          <p className="lp-section-subtitle">
            İhtiyacınıza uygun planı seçin. Taahhüt yok, istediğiniz zaman iptal edin.
          </p>
        </motion.div>

        <div className="lp-pricing__grid">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`lp-pricing__card ${plan.highlighted ? "lp-pricing__card--highlighted" : ""}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              {plan.highlighted && <div className="lp-pricing__badge">Popüler</div>}
              <h3 className="lp-pricing__name">{plan.name}</h3>
              <p className="lp-pricing__desc">{plan.desc}</p>
              <div className="lp-pricing__price">
                <span className="lp-pricing__amount">{plan.price}</span>
                {plan.period && <span className="lp-pricing__period">{plan.period}</span>}
              </div>
              <ul className="lp-pricing__features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={16} strokeWidth={1.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`btn ${plan.highlighted ? "btn-primary" : "btn-ghost"} btn-lg lp-pricing__cta`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
