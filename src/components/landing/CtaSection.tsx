"use client";

import Link from "next/link";
import { useScrollReveal } from "./useScrollReveal";

export default function CtaSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="lp-cta">
      <div className="lp__container">
        <div
          ref={ref}
          className={`lp-cta__box lp-reveal ${isVisible ? "lp-reveal--visible" : ""}`}
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
        </div>
      </div>
    </section>
  );
}
