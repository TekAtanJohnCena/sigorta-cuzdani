"use client";

import { useScrollReveal } from "./useScrollReveal";

const FEATURES = [
  {
    icon: "⚡",
    title: "Anlık Veri Aktarımı",
    desc: "Poliçe PDF'lerinizi sisteme yüklediğiniz anda akıllı asistanımız tüm verileri — şirket, prim, vadeler, şartlar — saniyeler içinde ayrıştırır ve yapılandırır.",
    large: false,
  },
  {
    icon: "🔔",
    title: "Erken Uyarı Sistemi",
    desc: "Vadesi yaklaşan poliçeleriniz için 30 gün önceden otomatik e-posta ve SMS uyarıları ile riskinizi sıfırlayın.",
    large: false,
  },
  {
    icon: "📊",
    title: "Gelişmiş Raporlama",
    desc: "Tüm şirketlerinizin prim bütçelerini gerçek zamanlı dashboard üzerinden analiz edin.",
    large: false,
  },
  {
    icon: "🔒",
    title: "Banka Sınıfı Güvenlik",
    desc: "Belgeleriniz 256-bit şifreleme ile izole bulut ortamında saklanır. %99.9 Uptime garantisi.",
    large: false,
  },
  {
    icon: "🤖",
    title: "AI Destekli Risk Analizi",
    desc: "Yapay zeka motorumuz tüm portföyünüzü sürekli izler, teminat boşluklarını ve risk yoğunlaşmalarını otomatik olarak tespit eder.",
    large: false,
  },
  {
    icon: "👥",
    title: "Çok Kullanıcılı Yönetim",
    desc: "Finans, satın alma ve yönetim ekiplerinize ayrı yetki seviyeleri tanımlayın. Herkes yalnızca görmesi gerekeni görsün.",
    large: false,
  },
];

export default function BentoFeatures() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="ozellikler" className="lp-bento-section">
      <div className="lp__container">
        <div className={`lp-section-header lp-reveal ${isVisible ? "lp-reveal--visible" : ""}`} ref={ref}>
          <h2 className="lp-section-title">Her Adım Kontrol Altında</h2>
          <p className="lp-section-subtitle">
            Karmaşık poliçe yönetimini saniyeler süren, görünür ve hatalara kapalı akıllı bir iş akışına dönüştürün.
          </p>
        </div>

        <div className="lp-bento">
          {FEATURES.map((f, i) => (
            <BentoCard key={i} feature={f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoCard({ feature, delay }: { feature: typeof FEATURES[0]; delay: number }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`lp-bento__card ${feature.large ? "lp-bento__card--large" : ""} lp-reveal ${isVisible ? "lp-reveal--visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="lp-bento__icon">{feature.icon}</div>
      <h3 className="lp-bento__title">{feature.title}</h3>
      <p className="lp-bento__desc">{feature.desc}</p>
    </div>
  );
}
