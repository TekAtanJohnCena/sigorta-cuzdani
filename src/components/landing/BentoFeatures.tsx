"use client";

import { motion } from "framer-motion";
import { Zap, Bell, BarChart3, Lock, Brain, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Anlık Veri Aktarımı",
    desc: "Poliçe PDF'lerinizi sisteme yüklediğiniz anda akıllı asistanımız tüm verileri — şirket, prim, vadeler, şartlar — saniyeler içinde ayrıştırır ve yapılandırır.",
  },
  {
    icon: Bell,
    title: "Erken Uyarı Sistemi",
    desc: "Vadesi yaklaşan poliçeleriniz için 30 gün önceden otomatik e-posta ve SMS uyarıları ile riskinizi sıfırlayın.",
  },
  {
    icon: BarChart3,
    title: "Gelişmiş Raporlama",
    desc: "Tüm şirketlerinizin prim bütçelerini gerçek zamanlı dashboard üzerinden analiz edin.",
  },
  {
    icon: Lock,
    title: "Banka Sınıfı Güvenlik",
    desc: "Belgeleriniz 256-bit şifreleme ile izole bulut ortamında saklanır. %99.9 Uptime garantisi.",
  },
  {
    icon: Brain,
    title: "AI Destekli Risk Analizi",
    desc: "Yapay zeka motorumuz tüm portföyünüzü sürekli izler, teminat boşluklarını ve risk yoğunlaşmalarını otomatik olarak tespit eder.",
  },
  {
    icon: Users,
    title: "Çok Kullanıcılı Yönetim",
    desc: "Finans, satın alma ve yönetim ekiplerinize ayrı yetki seviyeleri tanımlayın. Herkes yalnızca görmesi gerekeni görsün.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function BentoFeatures() {
  return (
    <section id="ozellikler" className="lp-bento-section">
      <div className="lp__container">
        <motion.div
          className="lp-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <h2 className="lp-section-title">Her Adım Kontrol Altında</h2>
          <p className="lp-section-subtitle">
            Karmaşık poliçe yönetimini saniyeler süren, görünür ve hatalara kapalı akıllı bir iş akışına dönüştürün.
          </p>
        </motion.div>

        <motion.div
          className="lp-bento"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {FEATURES.map((f, i) => (
            <BentoCard key={i} feature={f} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BentoCard({ feature }: { feature: typeof FEATURES[0] }) {
  const Icon = feature.icon;
  return (
    <motion.div className="lp-bento__card" variants={cardVariants}>
      <div className="lp-bento__icon">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="lp-bento__title">{feature.title}</h3>
      <p className="lp-bento__desc">{feature.desc}</p>
    </motion.div>
  );
}
