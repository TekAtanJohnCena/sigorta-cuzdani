"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getPoliciesByTenant } from "@/lib/firebase/firestore.client";
import { Policy, POLICY_TYPE_LABELS, POLICY_TYPE_ICONS } from "@/types/policy";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort, daysUntil } from "@/lib/utils/date";
import { useDemo } from "@/lib/context/DemoContext";
import { MOCK_POLICIES } from "@/lib/mockData";
import { calculatePortfolioScore } from "@/lib/engines/portfolioScoreEngine";

function getScoreColor(score: number) {
  if (score >= 75) return "var(--success-500)";
  if (score >= 55) return "var(--warning-500)";
  return "var(--danger-500)";
}

function getGradeColor(grade: string) {
  switch (grade) {
    case "A": return "var(--success-500)";
    case "B": return "var(--primary-500)";
    case "C": return "var(--warning-500)";
    case "D": return "var(--danger-400)";
    default: return "var(--danger-600)";
  }
}

export default function FinancePage() {
  const { appUser, loading: authLoading } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDemoMode } = useDemo();

  useEffect(() => {
    async function loadData() {
      if (!appUser) return;
      try {
        const data = await getPoliciesByTenant(appUser.tenantId);
        setPolicies(data as unknown as Policy[]);
      } catch (err) {
        console.error("Failed to load policies", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) {
      loadData();
    }
  }, [appUser, authLoading]);

  const effectivePolicies = isDemoMode ? MOCK_POLICIES : policies;

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--text-tertiary)" }}>Finansal veriler yükleniyor...</p>
      </div>
    );
  }

  const activePolicies = effectivePolicies.filter((p) => p.status === "active");
  const totalPremium = activePolicies.reduce((s, p) => s + p.premium.totalPremium, 0);
  const totalNet = activePolicies.reduce((s, p) => s + p.premium.netPremium, 0);
  const totalBsmv = activePolicies.reduce((s, p) => s + p.premium.bsmv, 0);

  // Portföy skoru — engine'den deterministik hesaplama
  const portfolioScore = calculatePortfolioScore(effectivePolicies);

  // Tür bazlı maliyet
  const typeBreakdown = Object.entries(
    activePolicies.reduce((acc, p) => {
      if (!acc[p.policyType]) acc[p.policyType] = { total: 0, count: 0 };
      acc[p.policyType].total += p.premium.totalPremium;
      acc[p.policyType].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).sort((a, b) => b[1].total - a[1].total);

  // Departman bazlı maliyet
  const deptBreakdown = Object.entries(
    activePolicies.reduce((acc, p) => {
      const dept = p.department || "Diğer";
      if (!acc[dept]) acc[dept] = { total: 0, count: 0 };
      acc[dept].total += p.premium.totalPremium;
      acc[dept].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).sort((a, b) => b[1].total - a[1].total);

  // ============================================================
  // 12 Aylık Nakit Akış Projeksiyonu
  // Mevcut taksit + yenileme tahminleri (enflasyon faktörü: %10 sabit)
  // ============================================================
  const RENEWAL_INFLATION = 1.10;
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Önümüzdeki 12 ay için (bu aydan itibaren)
  const next12Months = Array.from({ length: 12 }, (_, i) => {
    const monthIdx = (currentMonth + i) % 12;
    const year = currentYear + Math.floor((currentMonth + i) / 12);
    return { monthIdx, year, label: `${months[monthIdx]} ${year !== currentYear ? year : ""}`.trim() };
  });

  const monthlyData = next12Months.map(({ monthIdx, year }) => {
    let amount = 0;
    const items: string[] = [];

    // Taksit ödemeleri
    activePolicies.forEach(p => {
      (p.premium.installments || []).forEach(inst => {
        if (inst.status === "pending" && inst.dueDate) {
          const d = new Date(inst.dueDate);
          if (d.getMonth() === monthIdx && d.getFullYear() === year) {
            amount += inst.amount;
            items.push(`${p.insuranceCompany} taksit`);
          }
        }
      });
      // Yenileme tahmini (son ay ödemesi)
      if (p.premium.paymentType === "cash") {
        const endDate = new Date(p.endDate);
        if (endDate.getMonth() === monthIdx && endDate.getFullYear() === year) {
          const estimated = p.premium.totalPremium * RENEWAL_INFLATION;
          amount += estimated;
          items.push(`${p.insuranceCompany} yenileme tahmini`);
        }
      }
    });

    return { monthIdx, year, label: months[monthIdx] + (year !== currentYear ? ` '${String(year).slice(2)}` : ""), amount, items };
  });

  const maxMonthly = Math.max(...monthlyData.map(m => m.amount), 1);
  const peakMonth = monthlyData.reduce((best, m) => (m.amount > best.amount ? m : best), monthlyData[0]);
  const totalProjected = monthlyData.reduce((s, m) => s + m.amount, 0);

  // Yaklaşan yenileme listesi (önümüzdeki 12 ay)
  const upcomingRenewals = activePolicies
    .filter(p => {
      const days = daysUntil(p.endDate);
      return days >= 0 && days <= 365;
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="page-title">Finansal Analiz</h1>
        <p className="page-subtitle">
          Sigorta portföyünüzün maliyet analizi, risk değerlendirmesi ve 12 aylık nakit akış projeksiyonu
        </p>
      </div>

      {activePolicies.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "var(--space-8)" }}>
          <div className="empty-state-icon">💰</div>
          <div className="empty-state-title">Henüz Finansal Veri Yok</div>
          <div className="empty-state-description">Aktif olarak kaydedilmiş poliçe bulunmuyor.</div>
        </div>
      ) : (
        <>
          {/* Özet Kartlar */}
          <div className="grid-stats stagger-children" style={{ marginBottom: "var(--space-8)" }}>
            <div className="stats-card" data-color="teal">
              <div className="stats-icon">💰</div>
              <div className="stats-value">{formatCurrency(totalPremium)}</div>
              <div className="stats-label">Toplam Yıllık Prim</div>
            </div>
            <div className="stats-card" data-color="blue">
              <div className="stats-icon">📊</div>
              <div className="stats-value">{formatCurrency(totalNet)}</div>
              <div className="stats-label">Net Prim Toplamı</div>
            </div>
            <div className="stats-card" data-color="amber">
              <div className="stats-icon">🏛️</div>
              <div className="stats-value">{formatCurrency(totalBsmv)}</div>
              <div className="stats-label">Toplam BSMV/Gider</div>
            </div>
            <div className="stats-card" data-color={portfolioScore.overall >= 75 ? "green" : portfolioScore.overall >= 55 ? "amber" : "red"}>
              <div className="stats-icon">🛡️</div>
              <div className="stats-value">{portfolioScore.overall}<span style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>/100</span></div>
              <div className="stats-label">Portföy Risk Skoru</div>
              <div className="stats-change" style={{ background: "transparent", padding: 0, marginTop: 4, fontSize: 11, fontWeight: 700, color: getScoreColor(portfolioScore.overall) }}>
                {portfolioScore.grade} · {portfolioScore.label}
              </div>
            </div>
          </div>

          {/* 12 Aylık Nakit Akış + Risk */}
          <div className="grid-2" style={{ marginBottom: "var(--space-8)" }}>
            {/* Nakit Akış Grafiği */}
            <div className="chart-container">
              <div className="chart-header">
                <div className="chart-title">📈 12 Aylık Prim Ödeme Projeksiyonu</div>
              </div>

              {/* AI İçgörü */}
              {peakMonth.amount > 0 && (
                <div style={{ padding: "var(--space-3) var(--space-4)", background: "var(--warning-50)", border: "1px solid var(--warning-200)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--warning-800)", fontWeight: 500 }}>
                  ⚡ <strong>{peakMonth.label}</strong> ayında nakit çıkışınız zirve yapacak ({formatCurrency(peakMonth.amount)}). {peakMonth.items.length} ödeme bir arada. Şimdiden planlayın.
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)", height: 200, padding: "var(--space-4) 0" }}>
                {monthlyData.map((m, idx) => {
                  const height = (m.amount / maxMonthly) * 100;
                  const hasValue = m.amount > 0;
                  const isPeak = m.amount === peakMonth.amount && m.amount > 0;
                  return (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                      {hasValue && (
                        <div style={{ fontSize: 8, fontWeight: 700, color: isPeak ? "var(--warning-700)" : "var(--text-secondary)", whiteSpace: "nowrap" }}>
                          {formatCurrency(m.amount)}
                        </div>
                      )}
                      <div style={{
                        width: "100%", maxWidth: 40,
                        height: `${Math.max(height, 2)}%`,
                        background: isPeak
                          ? "linear-gradient(180deg, var(--warning-400), var(--warning-600))"
                          : hasValue
                            ? "linear-gradient(180deg, var(--primary-400), var(--primary-600))"
                            : "var(--neutral-200)",
                        borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                        transition: "height 0.5s ease-out",
                        minHeight: 4,
                      }} />
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 500 }}>{m.label}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "var(--space-4)", borderTop: "1px solid var(--neutral-100)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                <span>12 aylık toplam projeksiyon: <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(totalProjected)}</strong></span>
                <span style={{ color: "var(--neutral-400)", fontStyle: "italic" }}>*Yenilemeler %10 enflasyon ile tahmin edildi</span>
              </div>
            </div>

            {/* Risk Değerlendirmesi — Engine'den */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">⚡ Risk Değerlendirmesi</div>
                <span className="badge" style={{ background: getGradeColor(portfolioScore.grade), color: "white", fontSize: "var(--text-base)", fontWeight: 800, padding: "4px 14px" }}>
                  {portfolioScore.grade}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "center", margin: "var(--space-4) 0" }}>
                <div style={{ width: 120, height: 120, borderRadius: "50%", border: `6px solid ${getScoreColor(portfolioScore.overall)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800 }}>{portfolioScore.overall}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>/ 100</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {[
                  { label: "Teminat Yeterliliği", value: portfolioScore.breakdown.coverageAdequacy, hint: "Standart poliçe türleri kapsama oranı" },
                  { label: "Vade Sağlığı", value: portfolioScore.breakdown.expiryHealth, hint: "Yaklaşan vadelerden etkilenen skor" },
                  { label: "Ödeme Disiplini", value: portfolioScore.breakdown.paymentCompliance, hint: "Taksit ödeme düzeni" },
                  { label: "Çeşitlendirme", value: portfolioScore.breakdown.diversification, hint: "Farklı poliçe türleri" },
                  { label: "Maliyet Etkinliği", value: portfolioScore.breakdown.costEfficiency, hint: "Teminat/prim oranı" },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "var(--text-xs)" }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }} title={item.hint}>{item.label}</span>
                      <span style={{ fontWeight: 700 }}>{item.value}/100</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${item.value}%`, background: getScoreColor(item.value) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yenileme Takvimi + Maliyet Breakdown */}
          <div className="grid-2" style={{ marginBottom: "var(--space-8)" }}>
            {/* Yaklaşan Yenilemeler */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">📅 Önümüzdeki 12 Ay Yenileme Takvimi</div>
              </div>
              {upcomingRenewals.length === 0 ? (
                <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                  Önümüzdeki 12 ayda yenileme bulunmuyor.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {upcomingRenewals.map(p => {
                    const days = daysUntil(p.endDate);
                    const estimatedRenewal = Math.round(p.premium.totalPremium * RENEWAL_INFLATION);
                    return (
                      <div key={p.id} style={{ padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)", background: days <= 30 ? "var(--danger-50)" : days <= 90 ? "var(--warning-50)" : "var(--neutral-50)", border: `1px solid ${days <= 30 ? "var(--danger-200)" : days <= 90 ? "var(--warning-200)" : "var(--neutral-200)"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>
                              {POLICY_TYPE_ICONS[p.policyType as keyof typeof POLICY_TYPE_ICONS]} {p.insuranceCompany}
                            </div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 2 }}>
                              {POLICY_TYPE_LABELS[p.policyType as keyof typeof POLICY_TYPE_LABELS]} · {formatDateShort(p.endDate)} · <strong style={{ color: days <= 30 ? "var(--danger-700)" : "var(--text-secondary)" }}>{days} gün</strong>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Mevcut Prim</div>
                            <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{formatCurrency(p.premium.totalPremium)}</div>
                            <div style={{ fontSize: 10, color: "var(--warning-600)", fontWeight: 600 }}>~{formatCurrency(estimatedRenewal)} tahmini</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textAlign: "right", fontStyle: "italic", marginTop: 4 }}>
                    *Tahmini yenileme primleri mevcut primin %10 üzerinde hesaplanmıştır.
                  </div>
                </div>
              )}
            </div>

            {/* Türe Göre Maliyet */}
            <div>
              <div className="card" style={{ marginBottom: "var(--space-4)" }}>
                <div className="card-header">
                  <div className="card-title">🏷️ Sigorta Türüne Göre Maliyet</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {typeBreakdown.map(([type, data]) => {
                    const pType = type as keyof typeof POLICY_TYPE_LABELS;
                    const pct = Math.round((data.total / totalPremium) * 100);
                    return (
                      <div key={type} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--neutral-50)" }}>
                        <span style={{ fontSize: 24 }}>{POLICY_TYPE_ICONS[pType] || "📄"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{POLICY_TYPE_LABELS[pType] || type}</span>
                            <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{formatCurrency(data.total)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{data.count} poliçe</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>%{pct}</span>
                          </div>
                          <div className="progress-bar" style={{ height: 4, marginTop: 4 }}>
                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Departmana Göre Maliyet */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">🏢 Departmana Göre Maliyet</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {deptBreakdown.map(([dept, data]) => {
                    const pct = Math.round((data.total / totalPremium) * 100);
                    return (
                      <div key={dept} style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--neutral-50)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{dept}</span>
                          <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{formatCurrency(data.total)}</span>
                        </div>
                        <div className="progress-bar" style={{ height: 6 }}>
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                          <span>{data.count} poliçe</span>
                          <span>%{pct}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
