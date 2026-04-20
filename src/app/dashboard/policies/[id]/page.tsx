"use client";

import { useEffect, useState, use } from "react";
import { getPolicyById, deletePolicy } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useDemo } from "@/lib/context/DemoContext";
import { MOCK_POLICIES } from "@/lib/mockData";
import {
  Policy,
  POLICY_TYPE_LABELS,
  POLICY_TYPE_ICONS,
  POLICY_STATUS_LABELS,
} from "@/types/policy";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort, daysUntil, getRelativeTime } from "@/lib/utils/date";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  active: "badge-green badge-dot",
  expired: "badge-red badge-dot",
  cancelled: "badge-gray badge-dot",
  pending_review: "badge-amber badge-dot",
};

export default function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const { appUser, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(true);

  useEffect(() => {
    async function load() {
      // Demo mode: use mock data
      if (isDemoMode) {
        const mock = MOCK_POLICIES.find((p) => p.id === id);
        if (mock) {
          setPolicy(mock);
        } else {
          setError("Poliçe bulunamadı.");
        }
        setIsLoading(false);
        return;
      }

      if (!appUser) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getPolicyById(id);
        if (!data) {
          setError("Poliçe bulunamadı.");
        } else {
          setPolicy(data as Policy);
        }
      } catch (err) {
        console.error("Error loading policy:", err);
        setError("Poliçe yüklenirken hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      load();
    }
  }, [id, appUser, authLoading, isDemoMode]);

  const handleDelete = async () => {
    if (!confirm("Bu poliçeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    if (isDemoMode) {
      alert("Demo modunda poliçe silinemez.");
      return;
    }
    try {
      await deletePolicy(id);
      router.push("/dashboard/policies");
    } catch {
      alert("Silme işlemi başarısız oldu.");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="skeleton skeleton-circle" style={{ margin: "0 auto var(--space-4)" }} />
          <div className="skeleton skeleton-line medium" style={{ margin: "0 auto", width: 200 }} />
        </div>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">Hata</div>
        <div className="empty-state-description">{error || "Poliçe bulunamadı."}</div>
        <Link href="/dashboard/policies" className="btn btn-primary">
          ← Poliçelere Dön
        </Link>
      </div>
    );
  }

  const days = daysUntil(policy.endDate);
  const isExpiring = days >= 0 && days <= 30;
  const pdfUrl = policy.documents?.originalPdf;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
        <Link href="/dashboard/policies" style={{ color: "var(--primary-600)", textDecoration: "none", fontWeight: 500 }}>
          Poliçeler
        </Link>
        <span>›</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{policy.policyNumber}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <div style={{ fontSize: 36, background: "var(--primary-50)", width: 64, height: 64, borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {POLICY_TYPE_ICONS[policy.policyType]}
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>
              {POLICY_TYPE_LABELS[policy.policyType]} Poliçesi
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                {policy.policyNumber}
              </span>
              <span className={`badge ${STATUS_COLORS[policy.status]}`}>
                {POLICY_STATUS_LABELS[policy.status]}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {pdfUrl && (
            <>
              <button
                className={`btn ${showPdf ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setShowPdf(!showPdf)}
              >
                {showPdf ? "👁️ Önizlemeyi Kapat" : "👁️ PDF Önizle"}
              </button>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                ↗️ Tam Ekran
              </a>
            </>
          )}
          {!isDemoMode && (
            <button onClick={handleDelete} className="btn btn-danger">
              🗑️ Sil
            </button>
          )}
        </div>
      </div>

      {/* Two-panel layout: data left, PDF right */}
      <div style={{ display: "grid", gridTemplateColumns: showPdf && pdfUrl ? "1fr 1fr" : "1fr", gap: "var(--space-6)" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

          {/* Key Metrics */}
          <div className="grid-stats stagger-children">
            <div className="stats-card" data-color="teal">
              <div className="stats-icon">💰</div>
              <div className="stats-value">{formatCurrency(policy.premium.totalPremium)}</div>
              <div className="stats-label">Toplam Prim</div>
            </div>
            <div className="stats-card" data-color={isExpiring ? "red" : "blue"}>
              <div className="stats-icon">📅</div>
              <div className="stats-value" style={{ fontSize: "var(--text-lg)" }}>{formatDateShort(policy.endDate)}</div>
              <div className="stats-label">Vade Bitiş</div>
              <div className={`stats-change ${isExpiring ? "negative" : "positive"}`}>
                {getRelativeTime(policy.endDate)}
              </div>
            </div>
            <div className="stats-card" data-color={policy.aiExtraction.confidenceScore >= 85 ? "green" : policy.aiExtraction.confidenceScore >= 60 ? "amber" : "red"}>
              <div className="stats-icon">🤖</div>
              <div className="stats-value">{policy.aiExtraction.confidenceScore}<span style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>/100</span></div>
              <div className="stats-label">AI Güven Skoru</div>
            </div>
          </div>

          {/* Poliçe Bilgileri */}
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>📋 Poliçe Bilgileri</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {[
                { label: "Sigorta Şirketi", value: policy.insuranceCompany },
                { label: "Acente", value: policy.agencyName },
                { label: "Başlangıç Tarihi", value: formatDateShort(policy.startDate) },
                { label: "Bitiş Tarihi", value: formatDateShort(policy.endDate) },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                  <span style={{ fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Sigorta Ettiren</span>
                  <span style={{ fontWeight: 600, textAlign: "right" }}>{policy.policyHolder?.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Vergi/TC Kimlik</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{policy.policyHolder?.taxId || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prim Bilgileri */}
          <div className="card" style={{ padding: "var(--space-5)", background: "var(--primary-50)", border: "1px solid var(--primary-100)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--primary-900)" }}>💰 Prim Bilgileri</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--primary-700)" }}>Net Prim</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency(policy.premium.netPremium, policy.premium.currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--primary-700)" }}>Vergiler (BSMV + THGF)</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency((policy.premium.bsmv || 0) + (policy.premium.thgf || 0), policy.premium.currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--primary-200)", paddingTop: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <span style={{ color: "var(--primary-900)", fontWeight: 700, fontSize: "var(--text-lg)" }}>Toplam Prim</span>
                <span style={{ fontWeight: 800, fontSize: "var(--text-xl)", color: "var(--primary-700)" }}>
                  {formatCurrency(policy.premium.totalPremium, policy.premium.currency)}
                </span>
              </div>
              <div style={{ marginTop: "var(--space-2)", display: "flex", justifyContent: "flex-end" }}>
                <span className="badge badge-blue">
                  {policy.premium.paymentType === "installment" ? `Taksitli (${policy.premium.installmentCount || 0} Taksit)` : "Peşin"}
                </span>
              </div>
            </div>

            {/* Installments */}
            {policy.premium.installments && policy.premium.installments.length > 0 && (
              <div style={{ marginTop: "var(--space-4)" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--primary-800)" }}>Taksit Detayları</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {policy.premium.installments.map((inst, idx) => (
                    <div key={inst.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)",
                      background: inst.status === "paid" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
                      border: `1px solid ${inst.status === "paid" ? "var(--success-200)" : "var(--primary-200)"}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-secondary)" }}>
                          {idx + 1}/{policy.premium.installments!.length}
                        </span>
                        <span style={{ fontSize: "var(--text-sm)" }}>{formatDateShort(inst.dueDate)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                        <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{formatCurrency(inst.amount)}</span>
                        <span className={`badge ${inst.status === "paid" ? "badge-green" : inst.status === "overdue" ? "badge-red" : "badge-amber"}`}>
                          {inst.status === "paid" ? "✓ Ödendi" : inst.status === "overdue" ? "Gecikmiş" : "Bekliyor"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teminatlar */}
          {policy.coverages && policy.coverages.length > 0 && (
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>🛡️ Teminatlar</h3>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Teminat Adı</th>
                      <th>Teminat Bedeli</th>
                      <th>Muafiyet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policy.coverages.map((cov, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{cov.name}</td>
                        <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{formatCurrency(cov.amount, cov.currency)}</td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {cov.deductible ? `${cov.deductible}${cov.deductibleType === "percentage" ? "%" : " " + cov.currency}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Özel Şartlar */}
          {policy.notes && (
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>📝 Özel Şartlar</h3>
              <div style={{ whiteSpace: "pre-line", color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>
                {policy.notes}
              </div>
            </div>
          )}

          {/* AI Metadata */}
          <div className="card" style={{ padding: "var(--space-5)", background: "var(--neutral-50)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>🤖 Sistem Bilgileri</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", fontSize: "var(--text-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Kayıt Tarihi</span>
                <span style={{ fontWeight: 500 }}>{formatDateShort(policy.createdAt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-tertiary)" }}>AI Analiz Skoru</span>
                <div className="confidence-bar" style={{ minWidth: 100, margin: 0 }}>
                  <div className="confidence-bar-track">
                    <div className={`confidence-bar-fill ${policy.aiExtraction.confidenceScore >= 80 ? "high" : "medium"}`} style={{ width: `${policy.aiExtraction.confidenceScore}%` }}></div>
                  </div>
                  <span className="confidence-label">{policy.aiExtraction.confidenceScore}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>AI Model</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px", whiteSpace: "nowrap" }} title={policy.aiExtraction.model}>
                  {policy.aiExtraction.model}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Manuel İnceleme</span>
                <span style={{ fontWeight: 500 }}>{policy.aiExtraction.manuallyReviewed ? "✓ İncelendi" : "Bekliyor"}</span>
              </div>
              {policy.documents && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Dosya</span>
                  <span style={{ fontWeight: 500 }}>{policy.documents.fileName} ({(policy.documents.fileSize / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PDF Preview Panel */}
        {showPdf && pdfUrl && (
          <div className="card" style={{ padding: 0, overflow: "hidden", minHeight: "700px", border: "1px solid var(--border-light)", position: "sticky", top: "var(--space-4)", alignSelf: "start" }}>
            <iframe
              src={pdfUrl}
              style={{ width: "100%", height: "700px", border: "none" }}
              title="Poliçe Belgesi"
            />
          </div>
        )}
      </div>
    </div>
  );
}
