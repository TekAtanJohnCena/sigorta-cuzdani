"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { Policy, POLICY_TYPE_LABELS, POLICY_TYPE_ICONS } from "@/types/policy";
import { formatCurrency } from "@/lib/utils/currency";
import { useDemo } from "@/lib/context/DemoContext";
import { MOCK_POLICIES } from "@/lib/mockData";


function getGradeColor(grade: string) {
  switch (grade) {
    case "A": return "var(--success-500)";
    case "B": return "var(--accent-500)";
    case "C": return "var(--warning-500)";
    case "D": return "var(--danger-500)";
    case "F": return "var(--danger-600)";
    default: return "var(--neutral-500)";
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "var(--success-500)";
  if (score >= 60) return "var(--accent-500)";
  if (score >= 40) return "var(--warning-500)";
  return "var(--danger-500)";
}

export default function FinancePage() {
  const { appUser, loading: authLoading } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!appUser) return;
      try {
        const data = await getPoliciesByTenant(appUser.tenantId);
        setPolicies(data as Policy[]);
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

  const { isDemoMode } = useDemo();
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

  // Type breakdown
  const typeBreakdown = Object.entries(
    activePolicies.reduce((acc, p) => {
      if (!acc[p.policyType]) acc[p.policyType] = { total: 0, count: 0 };
      acc[p.policyType].total += p.premium.totalPremium;
      acc[p.policyType].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).sort((a, b) => b[1].total - a[1].total);

  // Department breakdown
  const deptBreakdown = Object.entries(
    activePolicies.reduce((acc, p) => {
      const dept = p.department || "Diğer";
      if (!acc[dept]) acc[dept] = { total: 0, count: 0 };
      acc[dept].total += p.premium.totalPremium;
      acc[dept].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).sort((a, b) => b[1].total - a[1].total);

  // Cash flow simulation (monthly)
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const monthlyPremiums = months.map(() => 0);
  
  activePolicies.forEach((p) => {
    if (p.premium.installments && p.premium.installments.length > 0) {
      p.premium.installments.forEach((inst) => {
        if (!inst.dueDate) return;
        const m = new Date(inst.dueDate).getMonth();
        monthlyPremiums[m] += inst.amount;
      });
    } else if (p.startDate) {
      const m = new Date(p.startDate).getMonth();
      monthlyPremiums[m] += p.premium.totalPremium;
    }
  });
  const maxMonthly = Math.max(...monthlyPremiums, 1);

  const riskScoreNum = effectivePolicies.length > 0 ? Math.round(100 - (activePolicies.filter(p => !p.premium.installments?.every(i => i.status === 'paid')).length / effectivePolicies.length) * 30) : 100;
  const grade = riskScoreNum >= 80 ? "A" : riskScoreNum >= 60 ? "B" : riskScoreNum >= 40 ? "C" : riskScoreNum >= 20 ? "D" : "F";
  
  const risk = {
    overallScore: riskScoreNum,
    grade: grade,
    breakdown: {
      coverageAdequacy: riskScoreNum - 5,
      policyExpiration: riskScoreNum + 5,
      paymentCompliance: riskScoreNum,
      diversification: Math.min(100, activePolicies.length * 10),
    },
    recommendations: activePolicies.length === 0 ? [] : [
      { id: "1", severity: "info", title: "Genel Değerlendirme", description: "Poliçelerinizin genel maliyet analizi yapılmıştır. Daha fazla çeşitlendirme önerilir." }
    ]
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="page-title">Finansal Analiz</h1>
        <p className="page-subtitle">
          Sigorta portföyünüzün maliyet analizi, risk değerlendirmesi ve nakit akış projeksiyonu
        </p>
      </div>

      {activePolicies.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "var(--space-8)" }}>
          <div className="empty-state-icon">💰</div>
          <div className="empty-state-title">Henüz Finansal Veri Yok</div>
          <div className="empty-state-description">Aktif olarak kaydedilmiş poliçe bulunmuyor. Sol menüden ilk poliçenizi yükleyin.</div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
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
            <div className="stats-card" data-color="green">
              <div className="stats-icon">📋</div>
              <div className="stats-value">{activePolicies.length}</div>
              <div className="stats-label">Aktif Poliçe Sayısı</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: "var(--space-8)" }}>
            {/* Monthly Cash Flow Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <div className="chart-title">📈 Aylık Prim Ödeme Dağılımı</div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "var(--space-2)",
                  height: 200,
                  padding: "var(--space-4) 0",
                }}
              >
                {months.map((month, idx) => {
                  const height = (monthlyPremiums[idx] / maxMonthly) * 100;
                  const hasValue = monthlyPremiums[idx] > 0;
                  return (
                    <div
                      key={month}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        height: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      {hasValue && (
                        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                          {formatCurrency(monthlyPremiums[idx])}
                        </div>
                      )}
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 40,
                          height: `${Math.max(height, 2)}%`,
                          background: hasValue
                            ? "linear-gradient(180deg, var(--primary-400), var(--primary-600))"
                            : "var(--neutral-200)",
                          borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                          transition: "height 0.5s ease-out",
                          minHeight: 4,
                        }}
                      />
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 500 }}>
                        {month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Score */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">⚡ Risk Değerlendirmesi</div>
                <span className="badge" style={{ background: getGradeColor(risk.grade), color: "white", fontSize: "var(--text-base)", fontWeight: 800, padding: "4px 14px" }}>
                  {risk.grade}
                </span>
              </div>

              {/* Score Circle */}
              <div style={{ display: "flex", justifyContent: "center", margin: "var(--space-4) 0" }}>
                <div
                  style={{
                    width: 120, height: 120, borderRadius: "50%",
                    border: `6px solid ${getScoreColor(risk.overallScore)}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}
                >
                  <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800 }}>{risk.overallScore}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>/ 100</div>
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {[
                  { label: "Teminat Yeterliliği", value: risk.breakdown.coverageAdequacy },
                  { label: "Vade Durumu", value: risk.breakdown.policyExpiration },
                  { label: "Ödeme Düzeni", value: risk.breakdown.paymentCompliance },
                  { label: "Çeşitlendirme", value: risk.breakdown.diversification },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "var(--text-xs)" }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontWeight: 700 }}>{item.value}/100</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${item.value}%`, background: `linear-gradient(90deg, ${getScoreColor(item.value)}, ${getScoreColor(item.value)})` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: "var(--space-8)" }}>
            {/* Cost by Type */}
            <div className="card">
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cost by Department */}
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
        </>
      )}
    </div>
  );
}
