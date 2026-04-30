"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/context/DemoContext";
import { useAuth } from "@/lib/firebase/AuthContext";
import { MOCK_POLICIES } from "@/lib/mockData";
import { POLICY_TYPE_LABELS, POLICY_TYPE_ICONS, Policy } from "@/types/policy";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort, daysUntil } from "@/lib/utils/date";

function UrgencyBadge({ days }: { days: number }) {
  if (days < 0) return <span style={{ background: "#450a0a", color: "#fca5a5", borderRadius: 99, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 700 }}>Süresi Doldu</span>;
  if (days <= 7) return <span style={{ background: "#450a0a", color: "#fca5a5", borderRadius: 99, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 700 }}>🚨 {days} gün</span>;
  if (days <= 30) return <span style={{ background: "#451a03", color: "#fdba74", borderRadius: 99, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 700 }}>⚠️ {days} gün</span>;
  return <span style={{ background: "#052e16", color: "#86efac", borderRadius: 99, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 700 }}>✅ {days} gün</span>;
}

export default function RenewalsPage() {
  const { isDemoMode } = useDemo();
  const { appUser } = useAuth();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const policies = isDemoMode ? MOCK_POLICIES : [];

  const renewalPolicies = useMemo(() => {
    return policies
      .filter(p => p.status === "active")
      .map(p => ({ ...p, daysLeft: daysUntil(p.endDate) }))
      .filter(p => p.daysLeft <= 90)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [policies]);

  const allActivePolicies = useMemo(() => {
    return policies
      .filter(p => p.status === "active")
      .map(p => ({ ...p, daysLeft: daysUntil(p.endDate) }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [policies]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 className="page-title">🔄 Yenileme Merkezi</h1>
        <p className="page-subtitle">Vadesi yaklaşan poliçelerinizi yönetin ve piyasadaki en iyi teklifleri karşılaştırın.</p>
      </div>

      {/* Savings Banner */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary-600) 0%, #7c3aed 100%)",
        borderRadius: "var(--radius-xl)", padding: "var(--space-6)", marginBottom: "var(--space-8)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)"
      }}>
        <div>
          <div style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Platformumuzun Etkisi</div>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: 900, color: "white" }}>Ortalama %15 Prim Tasarrufu</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)", marginTop: 4 }}>Platformumuzdaki şirketler yenileme döneminde piyasa karşılaştırması sayesinde ortalama %15 tasarruf ediyor.</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-lg)", padding: "var(--space-4) var(--space-6)", textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.7)", fontWeight: 700, marginBottom: 4 }}>Yapay Zeka Destekli</div>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 900, color: "white" }}>15 Şirket</div>
          <div style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.7)" }}>anlık karşılaştırma</div>
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="card" style={{ marginBottom: "var(--space-8)" }}>
        <div className="card-header">
          <div className="card-title">⏰ 90 Gün İçinde Vadesini Dolduracak Poliçeler</div>
          <span style={{ fontSize: "var(--text-xs)", background: "var(--danger-50)", color: "var(--danger-700)", padding: "2px 10px", borderRadius: 99, fontWeight: 700 }}>
            {renewalPolicies.length} poliçe
          </span>
        </div>

        {renewalPolicies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-10)", color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 48, marginBottom: "var(--space-3)" }}>🎉</div>
            <div style={{ fontWeight: 600 }}>Önümüzdeki 90 gün içinde vadeye girecek poliçeniz yok.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {renewalPolicies.map(p => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-3)",
                padding: "var(--space-4) var(--space-5)",
                border: `1px solid ${p.daysLeft <= 7 ? "var(--danger-200)" : p.daysLeft <= 30 ? "var(--warning-200)" : "var(--border-light)"}`,
                borderRadius: "var(--radius-lg)",
                background: p.daysLeft <= 7 ? "var(--danger-50)" : p.daysLeft <= 30 ? "var(--warning-50)" : "var(--bg-secondary)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                  <div style={{ fontSize: 28 }}>{POLICY_TYPE_ICONS[p.policyType]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>
                      {POLICY_TYPE_LABELS[p.policyType]} — {p.insuranceCompany}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginTop: 2 }}>
                      {p.policyNumber} · Bitiş: {formatDateShort(p.endDate)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: "var(--text-lg)" }}>{formatCurrency(p.premium.totalPremium)}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Mevcut yıllık prim</div>
                  </div>
                  <UrgencyBadge days={p.daysLeft} />
                  <Link
                    href={`/dashboard/renewals/quote-engine?policyId=${p.id}&policyType=${p.policyType}&currentPremium=${p.premium.totalPremium}&company=${encodeURIComponent(p.insuranceCompany)}`}
                    style={{
                      background: "linear-gradient(135deg, var(--primary-500), #7c3aed)",
                      color: "white", borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-5)",
                      fontWeight: 700, fontSize: "var(--text-sm)", textDecoration: "none", whiteSpace: "nowrap"
                    }}>
                    🔍 Piyasadan Teklif Topla
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Active Policies */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Tüm Aktif Poliçeler</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Poliçe Tipi</th>
                <th>Sigorta Şirketi</th>
                <th>Yıllık Prim</th>
                <th>Vade Bitişi</th>
                <th>Kalan Süre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allActivePolicies.map(p => (
                <tr key={p.id}>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                      {POLICY_TYPE_ICONS[p.policyType]} {POLICY_TYPE_LABELS[p.policyType]}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{p.insuranceCompany}</td>
                  <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{formatCurrency(p.premium.totalPremium)}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{formatDateShort(p.endDate)}</td>
                  <td><UrgencyBadge days={p.daysLeft} /></td>
                  <td>
                    <Link
                      href={`/dashboard/renewals/quote-engine?policyId=${p.id}&policyType=${p.policyType}&currentPremium=${p.premium.totalPremium}&company=${encodeURIComponent(p.insuranceCompany)}`}
                      style={{ color: "var(--primary-600)", fontWeight: 600, fontSize: "var(--text-sm)", textDecoration: "none" }}>
                      Teklif Al →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
