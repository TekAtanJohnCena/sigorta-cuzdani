"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { Policy } from "@/types/policy";
import { formatDateShort, getRelativeTime, daysUntil } from "@/lib/utils/date";
import { useDemo } from "@/lib/context/DemoContext";
import { MOCK_POLICIES } from "@/lib/mockData";

export interface Alert {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  policyId?: string;
  policyNumber?: string;
  dueDate?: string;
  isRead: boolean;
  createdAt: string;
}

const SEVERITY_LABELS = {
  critical: { label: "Kritik", badge: "badge-red badge-dot", icon: "🔴" },
  warning: { label: "Uyarı", badge: "badge-amber badge-dot", icon: "🟡" },
  info: { label: "Bilgi", badge: "badge-blue badge-dot", icon: "🔵" },
};

const TYPE_LABELS = {
  expiry: "Vade Sonu",
  payment: "Ödeme",
  system: "Sistem",
};

export default function AlertsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const [dbPolicies, setDbPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDemoMode } = useDemo();

  // Filters State
  const [filterSev, setFilterSev] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Actually, we need to track "read" status in local state since we don't have an alerts collection yet
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sigorta_cuzdani_read_alerts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setReadAlerts(new Set(parsed));
        }
      } catch (e) {
        console.error("Failed to parse read alerts from localStorage", e);
      }
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (readAlerts.size > 0) {
      localStorage.setItem("sigorta_cuzdani_read_alerts", JSON.stringify(Array.from(readAlerts)));
    }
  }, [readAlerts]);

  useEffect(() => {
    async function loadData() {
      if (isDemoMode) {
        setLoading(false);
        return;
      }
      if (!appUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPoliciesByTenant(appUser.tenantId);
        setDbPolicies(data as unknown as Policy[]);
      } catch (err) {
        console.error("Failed to load policies", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading) {
      loadData();
    }
  }, [appUser, authLoading, isDemoMode]);

  const policies = isDemoMode ? MOCK_POLICIES : dbPolicies;

  // Generate dynamic alerts from policies
  const alerts = useMemo(() => {
    const generatedAlerts: Alert[] = [];
    
    policies.forEach((p) => {
      if (p.status !== "active") return;

      // 1. Expiry alerts
      const expDays = daysUntil(p.endDate);
      if (expDays <= 30) {
        generatedAlerts.push({
          id: `exp-${p.id}`,
          type: "expiry",
          severity: expDays <= 7 ? "critical" : "warning",
          title: `${p.insuranceCompany} Poliçesi Sona Eriyor`,
          description: `${p.policyType.toUpperCase()} poliçesi (${p.policyNumber}) ${formatDateShort(p.endDate)} tarihinde (${getRelativeTime(p.endDate)}) sona erecek. Yenileme başlatılmalı.`,
          policyId: p.id,
          policyNumber: p.policyNumber,
          dueDate: p.endDate,
          isRead: readAlerts.has(`exp-${p.id}`),
          createdAt: new Date().toISOString(),
        });
      }

      // 2. Payment alerts
      if (p.premium.installments) {
        p.premium.installments.forEach((inst, idx) => {
          if (inst.status !== "paid" && inst.dueDate) {
            const dueDays = daysUntil(inst.dueDate);
            if (dueDays <= 15) {
              generatedAlerts.push({
                id: `pay-${inst.id}`,
                type: "payment",
                severity: dueDays < 0 ? "critical" : dueDays <= 5 ? "warning" : "info",
                title: `${p.insuranceCompany} Taksit Ödemesi`,
                description: `${p.policyType.toUpperCase()} poliçesinin ${idx + 1}. taksiti ödenmelidir.`,
                policyId: p.id,
                policyNumber: p.policyNumber,
                dueDate: inst.dueDate,
                isRead: readAlerts.has(`pay-${inst.id}`),
                createdAt: new Date().toISOString(),
              });
            }
          }
        });
      }
    });

    // Add a system welcome alert if no alerts generated to make sure empty state doesn't feel broken
    if (generatedAlerts.length === 0 && policies.length > 0) {
      generatedAlerts.push({
         id: "sys-welcome",
         type: "system",
         severity: "info",
         title: "Sistem Durumu",
         description: "Tüm poliçeleriniz sağlıklı durumda. Yaklaşan acil bir ödeme veya vade sonu bulunmuyor.",
         isRead: readAlerts.has("sys-welcome"),
         createdAt: new Date().toISOString()
      });
    }

    return generatedAlerts.sort((a, b) => new Date(a.dueDate || "2099-01-01").getTime() - new Date(b.dueDate || "2099-01-01").getTime());
  }, [policies, readAlerts]);

  const filtered = alerts.filter((a) => {
    if (filterSev !== "all" && a.severity !== filterSev) return false;
    if (filterType !== "all" && a.type !== filterType) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const markAllRead = () => {
    const newRead = new Set(readAlerts);
    alerts.forEach(a => newRead.add(a.id));
    setReadAlerts(newRead);
  };

  const markRead = (id: string) => {
    const newRead = new Set(readAlerts);
    newRead.add(id);
    setReadAlerts(newRead);
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--text-tertiary)" }}>Uyarılar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 className="page-title">Uyarı Merkezi</h1>
          <p className="page-subtitle">
            {unreadCount} okunmamış işlem · {alerts.length} toplam
          </p>
        </div>
        <button className="btn btn-secondary" onClick={markAllRead}>
          ✓ Tümünü Okundu İşaretle
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "var(--space-3) var(--space-4)", marginBottom: "var(--space-6)", display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <select className="input" style={{ width: "auto", minWidth: 140 }} value={filterSev} onChange={(e) => setFilterSev(e.target.value)}>
          <option value="all">Tüm Öncelikler</option>
          <option value="critical">🔴 Kritik</option>
          <option value="warning">🟡 Uyarı</option>
          <option value="info">🔵 Bilgi</option>
        </select>
        <select className="input" style={{ width: "auto", minWidth: 160 }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Tüm Türler</option>
          <option value="expiry">Vade Sonu</option>
          <option value="payment">Ödeme</option>
          <option value="system">Sistem</option>
        </select>
      </div>

      {/* Alerts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className="card card-hover"
            style={{
              padding: "var(--space-4) var(--space-5)",
              opacity: alert.isRead ? 0.7 : 1,
              borderLeft: `4px solid ${
                alert.severity === "critical" ? "var(--danger-500)" : alert.severity === "warning" ? "var(--warning-500)" : "var(--info-500)"
              }`,
              cursor: "pointer",
            }}
            onClick={() => markRead(alert.id)}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)" }}>
              <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>
                {SEVERITY_LABELS[alert.severity].icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: alert.isRead ? 500 : 700, fontSize: "var(--text-base)" }}>
                    {alert.title}
                  </span>
                  <span className={`badge ${SEVERITY_LABELS[alert.severity].badge}`}>
                    {SEVERITY_LABELS[alert.severity].label}
                  </span>
                  <span className="badge badge-gray">{TYPE_LABELS[alert.type as keyof typeof TYPE_LABELS]}</span>
                  {!alert.isRead && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary-500)" }} />}
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
                  {alert.description}
                </p>
                <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                  {alert.policyNumber && <span>📋 {alert.policyNumber}</span>}
                  {alert.dueDate && <span>📅 {formatDateShort(alert.dueDate)} ({getRelativeTime(alert.dueDate)})</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
           <div className="empty-state-icon">🔔</div>
           <div className="empty-state-title">Uyarı Bulunamadı</div>
           <div className="empty-state-description">Seçili filtrelere uygun veya aktif uyarı yok. Her şey yolunda görünüyor!</div>
        </div>
      )}
    </div>
  );
}
