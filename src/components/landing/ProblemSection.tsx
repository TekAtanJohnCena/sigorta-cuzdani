"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, LayoutDashboard } from "lucide-react";

const BEFORE_ITEMS = [
  "Poliçeler farklı klasörlerde dağınık",
  "Vade takibi manuel ve unutulmaya açık",
  "Teminat boşlukları görünmüyor",
  "Risk analizi için saatler harcanıyor",
  "Yenileme süreçleri kaotik",
];

const AFTER_ITEMS = [
  "Tüm poliçeler tek panelde",
  "Otomatik vade uyarıları",
  "Teminat boşlukları anında tespit",
  "AI destekli risk skoru saniyede",
  "Yenileme takvimi otomatik",
];

export default function ProblemSection() {
  return (
    <section className="lp-problem">
      <div className="lp__container">
        <motion.div
          className="lp-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="lp-section-title">Excel Kaosundan Çıkın</h2>
          <p className="lp-section-subtitle">
            Poliçe yönetimini Excel tabloları ve e-posta zincirleriyle yapmaya son verin.
          </p>
        </motion.div>

        <div className="lp-problem__grid">
          <motion.div
            className="lp-problem__card lp-problem__card--before"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="lp-problem__card-header">
              <FileSpreadsheet size={20} strokeWidth={1.5} />
              <span>Öncesi — Excel & E-posta</span>
            </div>
            <ul className="lp-problem__list">
              {BEFORE_ITEMS.map((item) => (
                <li key={item}>
                  <AlertTriangle size={16} strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="lp-problem__card lp-problem__card--after"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="lp-problem__card-header">
              <LayoutDashboard size={20} strokeWidth={1.5} />
              <span>Sonrası — Sigorta Cüzdanı</span>
            </div>
            <ul className="lp-problem__list">
              {AFTER_ITEMS.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
