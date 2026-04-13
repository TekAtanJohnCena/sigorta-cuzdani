"use client";

import { useEffect, useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { POLICY_TYPE_ICONS, POLICY_TYPE_LABELS, Policy } from "@/types/policy";
import { daysUntil, getRelativeTime, formatDateShort } from "@/lib/utils/date";
import Link from "next/link";
import { useDemo } from "@/lib/context/DemoContext";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { MOCK_POLICIES } from "@/lib/mockData";

interface DashboardStats {
  activePolicies: number;
  expiringCount: number;
  totalPremium: number;
  riskScore: number;
  expiringPolicies: Policy[];
  upcomingPayments: any[];
  typeCounts: Record<string, number>;
  companyCounts: Record<string, number>;
}

export default function DashboardPage() {
  const { appUser, loading: authLoading } = useAuth();
  const [dbPolicies, setDbPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo context
  const { isDemoMode, setIsDemoMode } = useDemo();

  useEffect(() => {
    async function loadData() {
      if (!appUser) return;
      try {
        const data = await getPoliciesByTenant(appUser.tenantId);
        setDbPolicies(data as Policy[]);
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

  // Use Db policies or Mock policies based on mode
  const policies = isDemoMode ? MOCK_POLICIES : dbPolicies;

  const { stats, sortedPayments } = useMemo(() => {
    const activePolicies = policies.filter((p) => p.status === "active");
    const totalPremium = activePolicies.reduce((sum, p) => sum + p.premium.totalPremium, 0);
    const expiringPolicies = activePolicies.filter((p) => {
      const days = daysUntil(p.endDate);
      return days >= 0 && days <= 90;
    });

    const upcomingPayments: any[] = [];
    activePolicies.forEach(p => {
       if (p.premium.paymentType === "installment" && p.premium.installments) {
          p.premium.installments.forEach(inst => {
            if (inst.status === "pending") {
              upcomingPayments.push({ ...inst, policyName: p.policyType, company: p.insuranceCompany });
            }
          });
       }
    });

    const sortedPayments = upcomingPayments.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const typeCounts: Record<string, number> = {};
    activePolicies.forEach((p) => {
      typeCounts[p.policyType] = (typeCounts[p.policyType] || 0) + 1;
    });

    const companyCounts: Record<string, number> = {};
    activePolicies.forEach((p) => {
      companyCounts[p.insuranceCompany] = (companyCounts[p.insuranceCompany] || 0) + 1;
    });

    // Score calculation
    const calculatedScore = policies.length > 0 ? Math.round(100 - (expiringPolicies.length / policies.length) * 30) : 100;

    return {
      stats: {
        activePolicies: activePolicies.length,
        expiringCount: expiringPolicies.length,
        totalPremium,
        riskScore: calculatedScore,
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
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Sigorta portföyünüzün genel özeti</p>
        </div>
        <div>
          {policies.length > 0 && (
             <div style={{ animation: "pulse 2s infinite" }}>
                <Link 
                  href="/dashboard/ai-analysis"
                  className="btn btn-primary" 
                  style={{ display: "flex", gap: "8px", alignItems: "center", background: "linear-gradient(135deg, #6200ea 0%, #aa00ff 100%)", borderColor: "transparent", fontSize: "1.05rem", padding: "10px 20px", textDecoration: "none" }}
                >
                  ✨ Yapay Zeka ile Analiz Et
                </Link>
             </div>
          )}
        </div>
      </div>

      <div className="grid-stats stagger-children" style={{ marginBottom: "var(--space-8)" }}>
        <Link href="/dashboard/policies" className="stats-card" data-color="blue" style={{ textDecoration: 'none' }}>
          <div className="stats-icon">📋</div>
          <div className="stats-value">{stats.activePolicies}</div>
          <div className="stats-label">Aktif Poliçe</div>
        </Link>


        <Link href="/dashboard/policies?status=expiring" className="stats-card" data-color={stats.expiringCount > 0 ? "red" : "green"} style={{ textDecoration: 'none' }}>
          <div className="stats-icon">⏰</div>
          <div className="stats-value">{stats.expiringCount}</div>
          <div className="stats-label">Yaklaşan Vadeler</div>
          <div className="stats-change negative">Son 90 gün</div>
        </Link>

        <Link href="/dashboard/finance" className="stats-card" data-color="teal" style={{ textDecoration: 'none' }}>
          <div className="stats-icon">💰</div>
          <div className="stats-value">{formatCurrency(stats.totalPremium)}</div>
          <div className="stats-label">Yıllık Toplam Prim</div>
        </Link>

        <Link href="/dashboard/ai-analysis" className="stats-card" data-color={stats.riskScore < 70 ? "red" : (stats.riskScore < 90 ? "amber" : "green")} style={{ textDecoration: 'none' }}>
          <div className="stats-icon">🛡️</div>
          <div className="stats-value">{stats.riskScore}<span style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>/100</span></div>
          <div className="stats-label">Portföy Güvenlik Skoru</div>
        </Link>
      </div>

      {/* Charts & Summaries (Insight Layer) */}
      <div className="grid-2" style={{ marginBottom: "var(--space-8)" }}>
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
                    background: `conic-gradient(
                      var(--primary-500) 0% ${Math.round((Object.values(stats.typeCounts)[0] / stats.activePolicies) * 100)}%,
                      var(--accent-500) ${Math.round((Object.values(stats.typeCounts)[0] / stats.activePolicies) * 100)}% ${Math.round(((Object.values(stats.typeCounts)[0] + (Object.values(stats.typeCounts)[1] || 0)) / stats.activePolicies) * 100)}%,
                      var(--success-500) ${Math.round(((Object.values(stats.typeCounts)[0] + (Object.values(stats.typeCounts)[1] || 0)) / stats.activePolicies) * 100)}% 100%
                    )`,
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
                    const colors = ["var(--primary-500)", "var(--accent-500)", "var(--success-500)", "var(--warning-500)", "var(--info-500)"];
                    const percentage = Math.round((count / stats.activePolicies) * 100);
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
                 {stats.expiringPolicies.slice(0, 2).map((p) => (
                    <div key={`exp-${p.id}`} style={{ padding: "12px", border: "1px solid var(--danger-200)", borderRadius: "8px", background: "var(--danger-50)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.85rem", color: "var(--danger-700)", fontWeight: 700, marginBottom: "2px" }}>Yenileme Yaklaşıyor ({daysUntil(p.endDate)} gün)</div>
                        <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 600 }}>{p.insuranceCompany} {POLICY_TYPE_LABELS[p.policyType as keyof typeof POLICY_TYPE_LABELS] || p.policyType}</div>
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-tertiary)" }}>{formatDateShort(p.endDate)}</div>
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
      </div>
    </div>
  );
}
