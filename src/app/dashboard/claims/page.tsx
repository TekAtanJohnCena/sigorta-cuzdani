"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { getClaimsByTenant, createClaim } from "@/lib/firebase/claims";
import { Policy, POLICY_TYPE_LABELS, POLICY_TYPE_ICONS } from "@/types/policy";
import { Claim, ClaimStatus, CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS, CLAIM_STATUS_ICONS, CLAIM_STATUS_ORDER } from "@/types/claim";
import { useDemo } from "@/lib/context/DemoContext";
import { CLAIM_REQUIREMENTS, DEFAULT_CLAIM_INFO } from "@/lib/data/claimRequirements";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort } from "@/lib/utils/date";


export default function ClaimsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [dbPolicies, setDbPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (isDemoMode) {
        // G-02: Lazy load mock data
        const { MOCK_CLAIMS } = await import("@/lib/mockData");
        setClaims(MOCK_CLAIMS);
        setLoading(false);
        return;
      }
      if (!appUser) { setLoading(false); return; }
      try {
        const [policiesData, claimsData] = await Promise.all([
          getPoliciesByTenant(appUser.tenantId),
          getClaimsByTenant(appUser.tenantId),
        ]);
        setDbPolicies(policiesData as unknown as Policy[]);
        setClaims(claimsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [appUser, authLoading, isDemoMode]);

  // Lazy load MOCK_POLICIES only when needed
  const [mockPolicies, setMockPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      import("@/lib/mockData").then(({ MOCK_POLICIES }) => {
        setMockPolicies(MOCK_POLICIES);
      });
    }
  }, [isDemoMode]);

  const policies = isDemoMode ? mockPolicies : dbPolicies;
  const activePolicies = policies.filter(p => p.status === "active");

  const selectedPolicy = activePolicies.find(p => p.id === selectedPolicyId);
  const claimInfo = selectedPolicy
    ? (CLAIM_REQUIREMENTS[selectedPolicy.policyType] || DEFAULT_CLAIM_INFO)
    : null;

  const stats = useMemo(() => {
    const open = claims.filter(c => !["paid", "rejected"].includes(c.status)).length;
    const paid = claims.filter(c => c.status === "paid").length;
    const totalApproved = claims.reduce((s, c) => s + (c.approvedAmount || 0), 0);
    return { open, paid, totalApproved, total: claims.length };
  }, [claims]);

  async function handleCreateClaim() {
    if (!selectedPolicy || !incidentDate || !description) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const claimData = {
        tenantId: isDemoMode ? "tenant-001" : (appUser?.tenantId || ""),
        policyId: selectedPolicy.id,
        policyNumber: selectedPolicy.policyNumber,
        policyType: selectedPolicy.policyType,
        insuranceCompany: selectedPolicy.insuranceCompany,
        claimDate: now.split("T")[0],
        incidentDate,
        description,
        estimatedAmount: estimatedAmount ? parseFloat(estimatedAmount) : undefined,
        status: "submitted" as ClaimStatus,
        statusHistory: [{ status: "submitted" as ClaimStatus, timestamp: now }],
        documents: [],
        updatedAt: now,
      };

      if (isDemoMode) {
        const mockNew: Claim = { ...claimData, id: `clm-demo-${Date.now()}`, createdAt: now };
        setClaims(prev => [mockNew, ...prev]);
      } else {
        const id = await createClaim(claimData);
        const newClaim: Claim = { ...claimData, id, createdAt: now };
        setClaims(prev => [newClaim, ...prev]);
      }

      setShowNewModal(false);
      setSelectedPolicyId(""); setIncidentDate(""); setDescription(""); setEstimatedAmount("");
    } catch (e) {
      console.error(e);
      alert("Hasar bildirimi oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--text-tertiary)" }}>Hasar verileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 className="page-title">🚨 Hasar Komuta Merkezi</h1>
          <p className="page-subtitle">Hasar dosyalarınızı takip edin, yeni hasar bildirin</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
          + Yeni Hasar Bildir
        </button>
      </div>

      {/* Stats */}
      <div className="grid-stats stagger-children" style={{ marginBottom: "var(--space-8)" }}>
        <div className="stats-card" data-color="blue">
          <div className="stats-icon">📁</div>
          <div className="stats-value">{stats.total}</div>
          <div className="stats-label">Toplam Hasar Dosyası</div>
        </div>
        <div className="stats-card" data-color={stats.open > 0 ? "amber" : "green"}>
          <div className="stats-icon">⏳</div>
          <div className="stats-value">{stats.open}</div>
          <div className="stats-label">Açık Dosya</div>
          <div className="stats-change" style={{ background: "transparent", padding: 0, marginTop: 4, fontSize: 11 }}>
            {stats.open > 0 ? "Takipte" : "Tümü kapatıldı"}
          </div>
        </div>
        <div className="stats-card" data-color="green">
          <div className="stats-icon">💰</div>
          <div className="stats-value" style={{ fontSize: "var(--text-xl)" }}>{formatCurrency(stats.totalApproved)}</div>
          <div className="stats-label">Onaylanan Tazminat</div>
        </div>
        <div className="stats-card" data-color="teal">
          <div className="stats-icon">✅</div>
          <div className="stats-value">{stats.paid}</div>
          <div className="stats-label">Ödenen Hasar</div>
        </div>
      </div>

      {/* Kanban Board */}
      {claims.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <div className="empty-state-title">Henüz Hasar Dosyası Yok</div>
          <div className="empty-state-description">Hasar bildiriminde bulunmak için &quot;Yeni Hasar Bildir&quot; butonunu kullanın.</div>
          <button className="btn btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={() => setShowNewModal(true)}>
            + Yeni Hasar Bildir
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "var(--space-4)", overflowX: "auto", paddingBottom: "var(--space-4)" }}>
          {CLAIM_STATUS_ORDER.map(status => {
            const statusClaims = claims.filter(c => c.status === status);
            return (
              <div key={status} style={{ minWidth: 240, flex: "0 0 240px" }}>
                {/* Sütun başlığı */}
                <div style={{ padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md) var(--radius-md) 0 0", background: "var(--neutral-100)", borderBottom: `3px solid ${CLAIM_STATUS_COLORS[status]}`, marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{CLAIM_STATUS_ICONS[status]}</span>
                  <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{CLAIM_STATUS_LABELS[status]}</span>
                  <span style={{ marginLeft: "auto", background: CLAIM_STATUS_COLORS[status], color: "white", borderRadius: "999px", fontSize: 11, fontWeight: 700, padding: "1px 8px" }}>{statusClaims.length}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {statusClaims.map(claim => (
                    <div key={claim.id} className="card" style={{ padding: "var(--space-4)", cursor: "default", borderLeft: `3px solid ${CLAIM_STATUS_COLORS[claim.status]}` }}>
                      <div style={{ fontSize: "1.2rem", marginBottom: "var(--space-2)" }}>
                        {POLICY_TYPE_ICONS[claim.policyType as keyof typeof POLICY_TYPE_ICONS] || "📋"}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", marginBottom: 4 }}>{claim.insuranceCompany}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>
                        {POLICY_TYPE_LABELS[claim.policyType as keyof typeof POLICY_TYPE_LABELS] || claim.policyType} · {claim.policyNumber}
                      </div>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "var(--space-2)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {claim.description}
                      </p>
                      {claim.estimatedAmount && (
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-primary)" }}>
                          Tahmini: {formatCurrency(claim.estimatedAmount)}
                        </div>
                      )}
                      {claim.approvedAmount && (
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--success-600)" }}>
                          Onaylanan: {formatCurrency(claim.approvedAmount)}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: "var(--space-2)" }}>
                        {formatDateShort(claim.claimDate)}
                      </div>
                    </div>
                  ))}
                  {statusClaims.length === 0 && (
                    <div style={{ padding: "var(--space-4)", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", background: "var(--neutral-50)", borderRadius: "var(--radius-md)", border: "1px dashed var(--neutral-300)" }}>
                      Dosya yok
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Yeni Hasar Modal */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal" style={{ maxWidth: 640, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🚨 Yeni Hasar Bildirimi</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {/* Poliçe Seçimi */}
              <div>
                <label className="label">Hangi Poliçeye Ait?</label>
                <select
                  className="input"
                  value={selectedPolicyId}
                  onChange={e => setSelectedPolicyId(e.target.value)}
                >
                  <option value="">— Poliçe seçin —</option>
                  {activePolicies.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.insuranceCompany} — {POLICY_TYPE_LABELS[p.policyType as keyof typeof POLICY_TYPE_LABELS] || p.policyType} ({p.policyNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Gerekli Evrak Listesi */}
              {claimInfo && (
                <div style={{ padding: "var(--space-4)", background: "var(--info-50)", border: "1px solid var(--info-200)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--info-900)", marginBottom: "var(--space-3)" }}>
                    📋 Bu hasar için hazırlamanız gereken belgeler:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {claimInfo.requiredDocs.map((doc, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "var(--text-xs)" }}>
                        <span style={{ marginTop: 1 }}>{doc.mandatory ? "🔴" : "🟡"}</span>
                        <div>
                          <span style={{ fontWeight: 600 }}>{doc.name}</span>
                          {" — "}
                          <span style={{ color: "var(--text-secondary)" }}>{doc.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "var(--space-3)", fontSize: 11, color: "var(--info-700)", fontWeight: 600 }}>
                    ⏱️ Hasar bildirimi için son: {claimInfo.notificationDeadlineDays} gün · Ort. işlem süresi: {claimInfo.avgProcessingDays} gün
                  </div>
                </div>
              )}

              {/* Olay Tarihi */}
              <div>
                <label className="label">Olay Tarihi</label>
                <input
                  type="date"
                  className="input"
                  value={incidentDate}
                  onChange={e => setIncidentDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="label">Hasar Açıklaması</label>
                <textarea
                  className="input"
                  rows={3}
                  style={{ resize: "vertical" }}
                  placeholder="Hasarın nasıl gerçekleştiğini kısaca açıklayın..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Tahmini Tutar */}
              <div>
                <label className="label">Tahmini Hasar Tutarı (TL) — Opsiyonel</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Örn: 50000"
                  value={estimatedAmount}
                  onChange={e => setEstimatedAmount(e.target.value)}
                />
              </div>

              {/* İpuçları */}
              {claimInfo && claimInfo.importantNotes.length > 0 && (
                <div style={{ padding: "var(--space-3) var(--space-4)", background: "var(--warning-50)", border: "1px solid var(--warning-200)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--warning-800)", marginBottom: "var(--space-2)" }}>⚠️ Önemli Notlar:</div>
                  {claimInfo.importantNotes.map((note, i) => (
                    <div key={i} style={{ fontSize: "var(--text-xs)", color: "var(--warning-700)", marginBottom: 4 }}>• {note}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowNewModal(false)}>İptal</button>
              <button
                className="btn btn-primary"
                onClick={handleCreateClaim}
                disabled={!selectedPolicyId || !incidentDate || !description || saving}
              >
                {saving ? "Kaydediliyor..." : "📨 Hasar Bildir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
