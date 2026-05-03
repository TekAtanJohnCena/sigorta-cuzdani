"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { POLICY_TYPE_LABELS, Policy } from "@/types/policy";
import { daysUntil, formatDateShort } from "@/lib/utils/date";
import Link from "next/link";
import { useDemo } from "@/lib/context/DemoContext";
import { useAuth } from "@/lib/firebase/AuthContext";
import { MOCK_POLICIES } from "@/lib/mockData";

interface UpcomingPayment {
  id?: string;
  amount: number;
  dueDate: string;
  status: string;
  policyName: string;
  company: string;
}
import { calculatePortfolioScore } from "@/lib/engines/portfolioScoreEngine";
import { usePolicies } from "@/lib/hooks/usePolicies";

export default function DashboardPage() {
  const { appUser, loading: authLoading } = useAuth();

  const { isDemoMode, setIsDemoMode } = useDemo();

  // G-09: usePolicies hook — eski useEffect + dbPolicies state'inin yerini aldı
  const { policies: dbPolicies, loading, error } = usePolicies(
    isDemoMode ? null : appUser?.tenantId
  );

  const policies = isDemoMode ? MOCK_POLICIES : dbPolicies;

  const { stats, sortedPayments } = useMemo(() => {
    const activePolicies = policies.filter((p) => p.status === "active");
    const totalPremium = activePolicies.reduce((sum, p) => sum + p.premium.totalPremium, 0);
    const expiringPolicies = activePolicies.filter((p) => {
      const days = daysUntil(p.endDate);
      return days >= 0 && days <= 90;
    });

    const upcomingPayments: UpcomingPayment[] = [];
    activePolicies.forEach(p => {
      if (p.premium.paymentType === "installment" && p.premium.installments) {
        p.premium.installments.forEach(inst => {
          if (inst.status === "pending") {
            upcomingPayments.push({ ...inst, policyName: p.policyType, company: p.insuranceCompany });
          }
        });
      }
    });

    const sortedPayments = upcomingPayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const typeCounts: Record<string, number> = {};
    activePolicies.forEach((p) => {
      typeCounts[p.policyType] = (typeCounts[p.policyType] || 0) + 1;
    });

    const companyCounts: Record<string, number> = {};
    activePolicies.forEach((p) => {
      companyCounts[p.insuranceCompany] = (companyCounts[p.insuranceCompany] || 0) + 1;
    });

    // Score via engine — deterministic, based on real policy data
    const portfolioScore = calculatePortfolioScore(policies);

    return {
      stats: {
        activePolicies: activePolicies.length,
        expiringCount: expiringPolicies.length,
        totalPremium,
        riskScore: portfolioScore.overall,
        riskGrade: portfolioScore.grade,
        riskLabel: portfolioScore.label,
        expiringPolicies,
        upcomingPayments,
        typeCounts,
        companyCounts,
      },
      sortedPayments
    };
  }, [policies]);

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--text-tertiary)" }}>Verileriniz yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center", padding: "var(--space-8)", background: "var(--danger-50)", border: "1px solid var(--danger-200)", borderRadius: "var(--radius-lg)", maxWidth: 420 }}>
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>⚠️</div>
          <div style={{ fontWeight: 700, color: "var(--danger-800)", marginBottom: "var(--space-2)" }}>Veriler Yüklenemedi</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--danger-700)" }}>Lütfen sayfayı yenileyip tekrar deneyin.</div>
        </div>
      </div>
    );
  }

  if (!isDemoMode && dbPolicies.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-16) var(--space-4)" }}>
        <div style={{ fontSize: "4rem", marginBottom: "var(--space-4)" }}>📊</div>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>AI Destekli Kurumsal Cüzdanınıza Hoş Geldiniz</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 550, margin: "0 auto var(--space-8)", lineHeight: 1.6 }}>
          Sigorta Cüzdanı sadece tarihlerinizi hatırlatmaz; karmaşık PDF sözleşmelerini okur, portföyünüzdeki <b>risk açıklarını</b> ve <b>boşa ödenen primleri</b> saniyeler içinde analiz eder.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button onClick={() => { setIsDemoMode(true); }} className="btn btn-secondary btn-lg" style={{ background: "white" }}>
            👁️ Demo Verilerle İncele
          </button>
          <Link href="/dashboard/upload" className="btn btn-primary btn-lg">
            🚀 Kendi Belgemi Yükle
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      href: "/dashboard/policies",
      color: "blue" as const,
      icon: "📋",
      value: String(stats.activePolicies),
      label: "Aktif Poliçe",
      sub: null,
      gradient: "linear-gradient(135deg, #EEF2FF 0%, #D8E0FF 100%)",
    },
    {
      href: "/dashboard/policies?status=expiring",
      color: (stats.expiringCount > 0 ? "red" : "green") as "red" | "green",
      icon: "⏰",
      value: String(stats.expiringCount),
      label: "Yaklaşan Vadeler",
      sub: "Son 90 gün",
      subColor: stats.expiringCount > 0 ? "var(--danger-600)" : "var(--success-600)",
      gradient: stats.expiringCount > 0
        ? "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)"
        : "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    },
    {
      href: "/dashboard/finance",
      color: "teal" as const,
      icon: "💰",
      value: formatCurrency(stats.totalPremium),
      label: "Yıllık Toplam Prim",
      sub: null,
      gradient: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)",
    },
    {
      href: "/dashboard/ai-analysis",
      color: (stats.riskScore < 55 ? "red" : stats.riskScore < 75 ? "amber" : "green") as "red" | "amber" | "green",
      icon: "🛡️",
      value: `${stats.riskScore}/100`,
      label: "Portföy Güvenlik Skoru",
      sub: `${(stats as any).riskGrade} Sınıfı — ${(stats as any).riskLabel}`,
      subColor: stats.riskScore >= 75 ? "var(--success-600)" : stats.riskScore >= 55 ? "var(--warning-600)" : "var(--danger-600)",
      gradient: stats.riskScore >= 75
        ? "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
        : stats.riskScore >= 55
        ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
        : "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)",
    },
  ];

  return (
    <div>
      {/* Header Context */}
      {isDemoMode && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--warning-50)", border: "1px solid var(--warning-200)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--warning-800)", fontWeight: 600 }}>
            👀 Şu an örnek (mock) şirket verilerini inceliyorsunuz. Sistemin size sağlayacağı değeri bu veriler üzerinden test edebilirsiniz.
          </div>
          <button onClick={() => { setIsDemoMode(false); }} className="btn btn-ghost btn-sm" style={{ color: "var(--warning-800)" }}>
            Kapat ve Sisteme Dön ✖
          </button>
        </div>
      )}

      <div style={{ marginBottom: "var(--space-8)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Dashboard</h1>
          <p className="page-subtitle">Sigorta portföyünüzün genel özeti</p>
        </div>
        <div>
          {policies.length > 0 && (
            <Link
              href="/dashboard/ai-analysis"
              className="btn btn-primary"
              style={{ display: "flex", gap: "8px", alignItems: "center", background: "linear-gradient(135deg, #6200ea 0%, #aa00ff 100%)", borderColor: "transparent", fontSize: "1rem", padding: "10px 22px", textDecoration: "none", boxShadow: "0 4px 16px rgba(98,0,234,0.3)" }}
            >
              ✨ Yapay Zeka ile Analiz Et
            </Link>
          )}
        </div>
      </div>

      <div className="grid-stats stagger-children" style={{ marginBottom: "var(--space-8)" }}>
        {statCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="stats-card"
            data-color={card.color}
            style={{ textDecoration: "none", background: card.gradient }}
          >
            <div className="stats-icon" style={{ fontSize: 24, width: 48, height: 48, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}>
              {card.icon}
            </div>
            <div className="stats-value" style={{ fontSize: "var(--text-3xl)", letterSpacing: "-0.03em" }}>
              {card.value}
            </div>
            <div className="stats-label" style={{ fontWeight: 600 }}>{card.label}</div>
            {card.sub && (
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: card.subColor, marginTop: 2 }}>
                {card.sub}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Sigortasız Varlık Uyarısı */}
      {policies.length > 0 && (
        <Link href="/dashboard/assets" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "var(--space-4) var(--space-5)",
          background: "linear-gradient(135deg, var(--info-50), var(--primary-50))",
          border: "1px solid var(--primary-200)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-8)",
          textDecoration: "none",
          transition: "var(--transition-fast)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{ fontSize: "1.5rem" }}>🏗️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--primary-900)" }}>
                Varlık Envanteri
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--primary-700)" }}>
                Araç, bina ve ekipmanlarınızı kaydedin — sigortasız varlıklarınızı tespit edin
              </div>
            </div>
          </div>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--primary-600)", fontWeight: 600 }}>Keşfet →</span>
        </Link>
      )}

      {/* Charts & Summaries (Insight Layer) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Portföy Dağılımı</div>
          </div>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center", minHeight: 180, flexWrap: "wrap" }}>
            {/* Pie Chart Visual */}
            {Object.entries(stats.typeCounts).length > 0 ? (
              <>
                <div style={{ position: 'relative', width: 140, height: 140 }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: (() => {
                      const entries = Object.values(stats.typeCounts);
                      const colors = ['var(--primary-500)', 'var(--accent-500)', 'var(--success-500)', 'var(--warning-500)', 'var(--info-500)', 'var(--danger-500)', '#8b5cf6', '#06b6d4'];
                      let cumPct = 0;
                      const segments = entries.map((count, idx) => {
                        const start = cumPct;
                        cumPct += ((count as number) / stats.activePolicies) * 100;
                        return `${colors[idx % colors.length]} ${Math.round(start)}% ${Math.round(cumPct)}%`;
                      });
                      return `conic-gradient(${segments.join(', ')})`;
                    })(),
                    boxShadow: 'inset 0 0 0 25px white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{stats.activePolicies}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOPLAM</div>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {Object.entries(stats.typeCounts).map(([type, count], idx) => {
                    const colors = ["var(--primary-500)", "var(--accent-500)", "var(--success-500)", "var(--warning-500)", "var(--info-500)", "var(--danger-500)", "#8b5cf6", "#06b6d4"];
                    const percentage = Math.round(((count as number) / stats.activePolicies) * 100);
                    const policyType = type as keyof typeof POLICY_TYPE_LABELS;
                    return (
                      <div key={type} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: colors[idx % colors.length] }} />
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{POLICY_TYPE_LABELS[policyType] || type}</span>
                        </div>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", fontWeight: 700 }}>%{percentage}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)", margin: "auto" }}>Yeterli veri yok</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Yaklaşan Vadeler & Taksit Ödemeleri</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Blend renewals and payments to show actionability */}
            {stats.expiringPolicies.length === 0 && sortedPayments.length === 0 ? (
              <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--text-tertiary)" }}>
                Şu an için yaklaşan bir işlem bulunmuyor.
              </div>
            ) : (
              <>
                {stats.expiringPolicies.slice(0, 2).map((p: Record<string, unknown>) => (
                  <div key={`exp-${p.id as string}`} style={{ padding: "12px", border: "1px solid var(--danger-200)", borderRadius: "8px", background: "var(--danger-50)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "var(--danger-700)", fontWeight: 700, marginBottom: "2px" }}>Yenileme Yaklaşıyor ({daysUntil(p.endDate as string)} gün)</div>
                      <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 600 }}>{p.insuranceCompany as string} {POLICY_TYPE_LABELS[(p.policyType as string) as keyof typeof POLICY_TYPE_LABELS] || (p.policyType as string)}</div>
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-tertiary)" }}>{formatDateShort(p.endDate as string)}</div>
                  </div>
                ))}

                {sortedPayments.slice(0, 3).map((pay) => (
                  <div key={`pay-${pay.id}`} style={{ padding: "12px", border: "1px solid var(--neutral-200)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "var(--primary-700)", fontWeight: 700, marginBottom: "2px" }}>Taksit Ödemesi</div>
                      <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 600 }}>{pay.company} {POLICY_TYPE_LABELS[pay.policyName as keyof typeof POLICY_TYPE_LABELS] || pay.policyName}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1rem", color: "var(--text-primary)", fontWeight: 700 }}>{formatCurrency(pay.amount)}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{formatDateShort(pay.dueDate)}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="card" style={{ background: "linear-gradient(135deg, var(--primary-50), var(--primary-100))", border: "1px solid var(--primary-200)" }}>
          <div className="card-header">
            <div className="card-title" style={{ color: "var(--primary-900)" }}>🚀 Aksiyon Merkezi</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "16px", background: "white", borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ fontSize: "1.2rem" }}>🔄</div>
                {stats.expiringCount > 0 && <span className="badge badge-red">{stats.expiringCount} Poliçe Bekliyor</span>}
              </div>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>Yenileme Fırsatı</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.5 }}>
                {stats.expiringCount > 0 
                  ? "Vadesi yaklaşan poliçeleriniz için piyasadaki en iyi teklifleri karşılaştırdık." 
                  : "Şu an yaklaşan bir yenilemeniz bulunmuyor."}
              </div>
              <Link href="/dashboard/renewals" className="btn btn-primary" style={{ width: "100%", textAlign: "center", textDecoration: "none" }}>
                Yenileme Merkezine Git →
              </Link>
            </div>
            
            <div style={{ padding: "16px", background: "white", borderRadius: "8px", boxShadow: "var(--shadow-sm)", marginTop: "4px" }}>
              <div style={{ fontSize: "1.2rem", marginBottom: "8px" }}>🤖</div>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>AI Analiz Raporu</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.5 }}>
                Portföyünüzdeki tüm poliçelerin detayları ve olası risk açıkları analiz edildi.
              </div>
              <Link href="/dashboard/ai-analysis" className="btn btn-secondary" style={{ width: "100%", textAlign: "center", textDecoration: "none" }}>
                Raporu Görüntüle →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
