"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useDemo } from "@/lib/context/DemoContext";
import { SECTOR_OPTIONS } from "@/lib/data/sectorInsurance";

export function OnboardingBanner() {
  const { appUser } = useAuth();
  const { isDemoMode } = useDemo();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sector, setSector] = useState("");
  const [revenue, setRevenue] = useState("");
  const [employees, setEmployees] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isDemoMode) { setProfileComplete(true); return; }
    if (!appUser) return;

    fetch("/api/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: appUser.tenantId, action: "check_onboarding" }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setProfileComplete(data.data.profileComplete);
      })
      .catch(() => {});
  }, [appUser, isDemoMode]);

  if (profileComplete === null || profileComplete || isDemoMode) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appUser || !sector || !revenue || !employees) return;
    setSaving(true);

    try {
      const res = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: appUser.tenantId,
          companyId: appUser.tenantId,
          action: "save_profile",
          sector,
          annualRevenue: parseFloat(revenue),
          employeeCount: parseInt(employees),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setProfileComplete(true), 2000);
      }
    } catch {
      alert("Profil kaydedilemedi. Tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div style={{ background: "linear-gradient(135deg, var(--success-500), var(--accent-500))", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: "var(--space-6)", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>Profil kaydedildi! Risk analizi otomatik basladi.</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9 }}>Risk skorunuz ve oneriler Risk Aciklari sayfasinda gorunecek.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(135deg, var(--primary-600), #7c3aed)", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: "var(--space-6)", color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🎯</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--text-base)" }}>
              Sirket profilinizi tamamlayin — Risk analizi baslasin
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>
              Sektorunuz ve buyukluk bilginizi girin, otomatik risk taramasi ve aksiyon onerileri alalim.
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "10px 20px", background: "white", color: "var(--primary-600)", border: "none", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}
          >
            Profili Tamamla
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label style={{ fontSize: 11, opacity: 0.8, display: "block", marginBottom: 4 }}>Sektor *</label>
            <select value={sector} onChange={e => setSector(e.target.value)} required style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "none", fontSize: 13 }}>
              <option value="">Seciniz</option>
              {SECTOR_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ fontSize: 11, opacity: 0.8, display: "block", marginBottom: 4 }}>Yillik Ciro (TL) *</label>
            <input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} required placeholder="10000000" style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "none", fontSize: 13 }} />
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ fontSize: 11, opacity: 0.8, display: "block", marginBottom: 4 }}>Calisan Sayisi *</label>
            <input type="number" value={employees} onChange={e => setEmployees(e.target.value)} required placeholder="50" style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "none", fontSize: 13 }} />
          </div>
          <button type="submit" disabled={saving} style={{ padding: "8px 20px", background: "white", color: "var(--primary-600)", border: "none", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            {saving ? "Kaydediliyor..." : "Kaydet ve Analiz Baslat"}
          </button>
        </form>
      )}
    </div>
  );
}
