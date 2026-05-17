"use client";

import { useScrollReveal } from "./useScrollReveal";

const TESTIMONIALS = [
  {
    quote: "Excel'de takip ettiğimiz 120 poliçeyi 10 dakikada sisteme aktardık. Artık vade takibi otomatik, hiçbir yenileme kaçmıyor.",
    name: "Mehmet K.",
    title: "CFO, Üretim Sektörü",
    metric: "120+ poliçe",
  },
  {
    quote: "Risk analizi raporları sayesinde teminat eksikliklerini tespit ettik ve 2M TL'lik bir kayıp riskinden kaçındık.",
    name: "Ayşe T.",
    title: "Risk Müdürü, Lojistik",
    metric: "2M TL risk azaltma",
  },
  {
    quote: "Personellerimiz artık hangi poliçenin ne zaman biteceğini sormak için beni aramamıyor. Herkes kendi panelinden takip ediyor.",
    name: "Burak S.",
    title: "Genel Müdür, İnşaat",
    metric: "%80 zaman tasarrufu",
  },
];

export default function Testimonials() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="lp-testimonials">
      <div className="lp__container">
        <div
          ref={ref}
          className={`lp-reveal ${isVisible ? "lp-reveal--visible" : ""}`}
        >
          <h2 className="lp-testimonials__title">Müşterilerimiz Ne Diyor?</h2>
          <p className="lp-testimonials__subtitle">
            Platformumuzu kullanan şirketlerden gerçek geri bildirimler
          </p>

          <div className="lp-testimonials__grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="lp-testimonials__card">
                <div className="lp-testimonials__metric">{t.metric}</div>
                <blockquote className="lp-testimonials__quote">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="lp-testimonials__author">
                  <div className="lp-testimonials__avatar">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="lp-testimonials__name">{t.name}</div>
                    <div className="lp-testimonials__role">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
