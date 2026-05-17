"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";
import { motion } from "framer-motion";
import { Shield, FileCheck, Headphones } from "lucide-react";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="lp-hero">
      <div className="lp-hero__bg" aria-hidden="true">
        <div className="lp-hero__grid-pattern" />
      </div>

      <div className="lp__container">
        <div className="lp-hero__grid">
          <div className="lp-hero__text">
            <motion.div
              className="lp-hero__badge"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Kurumsal Poliçe Yönetim Platformu
            </motion.div>

            <motion.h1
              className="lp-hero__title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Sigorta Süreçlerinizi{" "}
              <span>Tek Panelde Toplayın</span>
            </motion.h1>

            <motion.p
              className="lp-hero__subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              Excel tablolarına ve manuel takiplere son verin. Platformumuz ile
              poliçelerinizi otomatik sisteme aktarın, vade günlerini kaçırmayın
              ve kurumsal risklerinizi azaltın.
            </motion.p>

            <motion.div
              className="lp-hero__cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/demo/request" className="btn btn-primary btn-lg">
                Demo Talep Et
              </Link>
              {user && (
                <Link href="/dashboard" className="btn btn-secondary btn-lg">
                  Dashboard&apos;a Git
                </Link>
              )}
            </motion.div>

            <motion.div
              className="lp-hero__features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <span><Shield size={14} strokeWidth={1.5} /> KVKK Uyumlu</span>
              <span><FileCheck size={14} strokeWidth={1.5} /> PDF &amp; Tarama Analizi</span>
              <span><Headphones size={14} strokeWidth={1.5} /> 7/24 Destek</span>
            </motion.div>
          </div>

          <motion.div
            className="lp-hero__visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="lp-mockup">
              <div className="lp-mockup__header">
                <div className="lp-mockup__dots">
                  <span /><span /><span />
                </div>
                <div className="lp-mockup__url">sigortacuzdani.net/dashboard</div>
              </div>
              <div className="lp-mockup__body">
                <div className="lp-mockup__sidebar">
                  <div className="lp-mockup__sidebar-icon lp-mockup__sidebar-icon--active" />
                  <div className="lp-mockup__sidebar-icon" />
                  <div className="lp-mockup__sidebar-icon" />
                  <div className="lp-mockup__sidebar-icon" />
                </div>
                <div className="lp-mockup__content">
                  <div className="lp-mockup__stats">
                    <div className="lp-mockup__stat-box">
                      <span className="lp-mockup__stat-label">Aktif Poliçe</span>
                      <span className="lp-mockup__stat-value">24</span>
                    </div>
                    <div className="lp-mockup__stat-box lp-mockup__stat-box--danger">
                      <span className="lp-mockup__stat-label">Vadesi Yaklaşan</span>
                      <span className="lp-mockup__stat-value lp-mockup__stat-value--danger">3</span>
                    </div>
                    <div className="lp-mockup__stat-box">
                      <span className="lp-mockup__stat-label">Toplam Prim</span>
                      <span className="lp-mockup__stat-value">₺142.5K</span>
                    </div>
                  </div>
                  <div className="lp-mockup__table">
                    <div className="lp-mockup__table-header">
                      <span>Poliçe Tipi</span><span>Şirket</span><span>Bitiş</span><span>Durum</span>
                    </div>
                    <div className="lp-mockup__table-row">
                      <span className="lp-mockup__table-cell--primary">Kasko</span>
                      <span>Allianz</span>
                      <span>12.05.2026</span>
                      <span className="lp-mockup__status lp-mockup__status--warning">Ödeme Bekliyor</span>
                    </div>
                    <div className="lp-mockup__table-row">
                      <span className="lp-mockup__table-cell--primary">Sağlık</span>
                      <span>Anadolu</span>
                      <span>24.08.2026</span>
                      <span className="lp-mockup__status lp-mockup__status--success">Aktif</span>
                    </div>
                    <div className="lp-mockup__table-row">
                      <span className="lp-mockup__table-cell--primary">İşyeri</span>
                      <span>AXA</span>
                      <span>01.11.2026</span>
                      <span className="lp-mockup__status lp-mockup__status--success">Aktif</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
