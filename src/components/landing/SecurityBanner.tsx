"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Server, RefreshCw, MapPin } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "ISO 27001 Sertifikalı Altyapı" },
  { icon: Lock, label: "256-Bit SSL Şifreleme" },
  { icon: ShieldCheck, label: "KVKK %100 Uyumlu" },
  { icon: RefreshCw, label: "Düzenli Yedekleme" },
  { icon: MapPin, label: "Türkiye Sunucuları" },
];

export default function SecurityBanner() {
  return (
    <section id="guvenlik" className="lp-security">
      <div className="lp__container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="lp-security__title">%100 KVKK Uyumlu ve Güvenli</h2>
          <p className="lp-security__subtitle">
            Verileriniz Türkiye sunucularında, bankacılık standartlarında güvenlik
            protokolleri ile korunmaktadır.
          </p>
          <div className="lp-security__badges">
            {BADGES.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.span
                  key={badge.label}
                  className="lp-security__badge"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Icon size={16} strokeWidth={1.5} style={{ marginRight: "8px", opacity: 0.8 }} />
                  {badge.label}
                </motion.span>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
