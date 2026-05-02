"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { formatCurrency } from "@/lib/utils/currency";

interface AIStatsData {
  totalCalls: number;
  totalCostUSD: number;
  averageLatencyMs: number;
  providerBreakdown: {
    provider: string;
    calls: number;
    costUSD: number;
    avgLatency: number;
  }[];
  operationBreakdown: {
    operation: string;
    calls: number;
    avgLatency: number;
  }[];
  topRisks: {
    category: string;
    count: number;
  }[];
  last30Days: {
    date: string;
    calls: number;
    costUSD: number;
  }[];
}

export default function AIStatsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AIStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!appUser || appUser.role !== "admin") {
        setError("Bu sayfaya erişim yetkiniz yok.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/ai-stats");
        const data = await res.json();

        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || "Veriler yüklenemedi");
        }
      } catch (err) {
        console.error("Failed to fetch AI stats:", err);
        setError("Sunucu hatası");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchStats();
    }
  }, [appUser, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--text-tertiary)" }}>Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">Hata</div>
        <div className="empty-state-description">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <div className="empty-state-title">Veri Yok</div>
        <div className="empty-state-description">Henüz AI kullanım verisi bulunmuyor.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 className="page-title">AI Metrics Dashboard</h1>
        <p className="page-subtitle">
          Sistem genelinde yapay zeka kullanım istatistikleri ve maliyet analizi
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid-stats stagger-children" style={{ marginBottom: "var(--space-6)" }}>
        <div className="stats-card" data-color="blue">
          <div className="stats-icon">🤖</div>
          <div className="stats-value">{stats.totalCalls.toLocaleString("tr-TR")}</div>
          <div className="stats-label">Toplam AI Çağrısı</div>
          <div className="stats-change positive">Son 30 Gün</div>
        </div>

        <div className="stats-card" data-color="green">
          <div className="stats-icon">💰</div>
          <div className="stats-value">${stats.totalCostUSD.toFixed(2)}</div>
          <div className="stats-label">Toplam Maliyet</div>
          <div className="stats-change positive">{(stats.totalCostUSD / stats.totalCalls).toFixed(4)}$/çağrı</div>
        </div>

        <div className="stats-card" data-color="purple">
          <div className="stats-icon">⚡</div>
          <div className="stats-value">{stats.averageLatencyMs.toFixed(0)}ms</div>
          <div className="stats-label">Ortalama Gecikme</div>
          <div className="stats-change">Tüm Operasyonlar</div>
        </div>

        <div className="stats-card" data-color="orange">
          <div className="stats-icon">📈</div>
          <div className="stats-value">
            {stats.topRisks.length > 0 ? stats.topRisks[0].count : 0}
          </div>
          <div className="stats-label">En Sık Risk Kategorisi</div>
          <div className="stats-change">{stats.topRisks.length > 0 ? stats.topRisks[0].category : "N/A"}</div>
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className="card" style={{ marginBottom: "var(--space-6)", padding: "var(--space-5)" }}>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          🔌 Provider Dağılımı
        </h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Çağrı Sayısı</th>
                <th>Toplam Maliyet</th>
                <th>Ortalama Gecikme</th>
              </tr>
            </thead>
            <tbody>
              {stats.providerBreakdown.map((p) => (
                <tr key={p.provider}>
                  <td style={{ fontWeight: 600 }}>{p.provider.toUpperCase()}</td>
                  <td>{p.calls.toLocaleString("tr-TR")}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>${p.costUSD.toFixed(4)}</td>
                  <td style={{ color: p.avgLatency < 2000 ? "var(--success-600)" : "var(--warning-600)" }}>
                    {p.avgLatency.toFixed(0)}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operation Breakdown */}
      <div className="card" style={{ marginBottom: "var(--space-6)", padding: "var(--space-5)" }}>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          ⚙️ Operasyon Dağılımı
        </h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Operasyon</th>
                <th>Çağrı Sayısı</th>
                <th>Ortalama Gecikme</th>
              </tr>
            </thead>
            <tbody>
              {stats.operationBreakdown.map((op) => (
                <tr key={op.operation}>
                  <td style={{ fontWeight: 600 }}>{op.operation}</td>
                  <td>{op.calls.toLocaleString("tr-TR")}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{op.avgLatency.toFixed(0)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Detected Risks */}
      <div className="card" style={{ marginBottom: "var(--space-6)", padding: "var(--space-5)" }}>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          🎯 En Sık Tespit Edilen Riskler
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {stats.topRisks.map((risk, idx) => (
            <div
              key={risk.category}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-3)",
                background: "var(--neutral-50)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span style={{ fontWeight: 700, color: "var(--text-tertiary)", minWidth: 24 }}>
                  #{idx + 1}
                </span>
                <span style={{ fontWeight: 600 }}>{risk.category}</span>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "var(--text-lg)",
                  color: "var(--primary-600)",
                }}
              >
                {risk.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 30 Day Trend */}
      <div className="card" style={{ padding: "var(--space-5)" }}>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          📈 30 Günlük Trend
        </h3>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", minWidth: "600px" }}>
            {stats.last30Days.map((day) => {
              const maxCalls = Math.max(...stats.last30Days.map((d) => d.calls));
              const height = maxCalls > 0 ? (day.calls / maxCalls) * 120 : 0;
              return (
                <div
                  key={day.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "var(--space-1)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${height}px`,
                      background: "linear-gradient(to top, var(--primary-500), var(--primary-300))",
                      borderRadius: "var(--radius-sm)",
                      minHeight: "2px",
                    }}
                    title={`${day.calls} çağrı - $${day.costUSD.toFixed(2)}`}
                  />
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
