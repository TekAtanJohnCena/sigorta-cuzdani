"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CtaSection() {
  return (
    <section className="lp-cta">
      <div className="lp__container">
        <motion.div
          className="lp-cta__box"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="lp-cta__title">
            İşletmenizin Risklerini Şansa Bırakmayın
          </h2>
          <p className="lp-cta__desc">
            Platformumuzu yakından görmek için bir demo toplantısı talep edin.
            Şirketinizin ihtiyaçlarına özel kurulum ve eğitim desteği veriyoruz.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <Link href="/demo/request" className="btn btn-primary btn-lg">
              Demo Toplantısı Planlayın
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
