"use client";

import { useEffect, useState, use } from "react";
import { getPolicyById } from "@/lib/firebase/firestore";
import { Policy } from "@/types/policy";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort } from "@/lib/utils/date";
import { POLICY_TYPE_LABELS, POLICY_TYPE_ICONS, POLICY_STATUS_LABELS } from "@/types/policy";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(true);

  useEffect(() => {
    async function load() {
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
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-12)" }}>
        <div style={{ fontSize: "var(--text-lg)" }}>Poliçe detayları yükleniyor...</div>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">Hata</div>
        <div className="empty-state-description">{error}</div>
        <button className="btn btn-primary" onClick={() => router.back()}>
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <button className="btn btn-ghost" onClick={() => router.back()}>
          ← Geri
        </button>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>{POLICY_TYPE_ICONS[policy.policyType]} {POLICY_TYPE_LABELS[policy.policyType]} Poliçesi</span>
            <span className={`badge ${policy.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
              {POLICY_STATUS_LABELS[policy.status]}
            </span>
          </h1>
          <p className="page-subtitle">
            {policy.insuranceCompany} · {policy.policyNumber}
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          {(policy.documents?.originalPdf || policy.aiExtraction?.documentUrl) && (
            <>
              <button 
                className={`btn ${showPdf ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowPdf(!showPdf)}
              >
                {showPdf ? "👁️ Önizlemeyi Kapat" : "👁️ PDF Önizle"}
              </button>
              <a 
                href={policy.documents?.originalPdf || policy.aiExtraction?.documentUrl} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary"
              >
                ↗️ Tam Ekran
              </a>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: showPdf && (policy.documents?.originalPdf || policy.aiExtraction?.documentUrl) ? "1fr 1fr" : "1fr", gap: "var(--space-6)" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Poliçe Bilgileri</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Acente</span>
              <span style={{ fontWeight: 500 }}>{policy.agencyName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Başlangıç Tarihi</span>
              <span style={{ fontWeight: 500 }}>{formatDateShort(policy.startDate)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Bitiş Tarihi</span>
              <span style={{ fontWeight: 500 }}>{formatDateShort(policy.endDate)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: "var(--space-3)", marginTop: "var(--space-2)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Sigorta Ettiren</span>
              <span style={{ fontWeight: 600, textAlign: "right" }}>{policy.policyHolder?.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Vergi/TC Kimlik</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{policy.policyHolder?.taxId || "-"}</span>
            </div>
          </div>
        </div>

        {/* Prim ve Ödeme Bilgileri */}
        <div className="card" style={{ padding: "var(--space-5)", background: "var(--primary-50)", border: "1px solid var(--primary-100)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--primary-900)" }}>Prim Bilgileri</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--primary-700)" }}>Net Prim</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(policy.premium.netPremium, policy.premium.currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--primary-700)" }}>Vergiler (BSMV vs.)</span>
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
                 {policy.premium.paymentType === "installment" ? `Taksitli (${policy.premium.installmentCount} Taksit)` : "Peşin"}
               </span>
            </div>
          </div>
        </div>

      </div>

      {/* Teminatlar */}
      {policy.coverages && policy.coverages.length > 0 && (
        <div className="card" style={{ marginTop: "var(--space-6)", padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Teminatlar ve Bedelleri</h3>
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
                      {cov.deductible ? `${cov.deductible}${cov.deductibleType === "percentage" ? "%" : " " + cov.currency}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Özel Şartlar / AI Metadata */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)", marginTop: "var(--space-6)" }}>
        {policy.notes && (
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Özel Şartlar ve Notlar</h3>
            <div style={{ whiteSpace: "pre-line", color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>
              {policy.notes}
            </div>
          </div>
        )}

        <div className="card" style={{ padding: "var(--space-5)", height: "fit-content" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Sistem Bilgileri</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", fontSize: "var(--text-sm)" }}>
             <div style={{ display: "flex", justifyContent: "space-between" }}>
               <span style={{ color: "var(--text-tertiary)" }}>Kayıt Tarihi</span>
               <span style={{ fontWeight: 500 }}>{formatDateShort(policy.createdAt)}</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <span style={{ color: "var(--text-tertiary)" }}>AI Analiz Skoru</span>
               <div className="confidence-bar" style={{ minWidth: 80, margin: 0 }}>
                  <div className="confidence-bar-track">
                     <div className={`confidence-bar-fill ${policy.aiExtraction.confidenceScore >= 80 ? "high" : "medium"}`} style={{ width: `${policy.aiExtraction.confidenceScore}%` }}></div>
                  </div>
               </div>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between" }}>
               <span style={{ color: "var(--text-tertiary)" }}>AI Model</span>
               <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px", whiteSpace: "nowrap" }} title={policy.aiExtraction.model}>
                 {policy.aiExtraction.model}
               </span>
             </div>
          </div>
        </div>
      </div>

        </div>
      </div>

      {showPdf && (policy.documents?.originalPdf || policy.aiExtraction?.documentUrl) && (
        <div className="card" style={{ padding: 0, overflow: "hidden", minHeight: "600px", border: "1px solid var(--border-light)" }}>
          <iframe 
            src={policy.documents?.originalPdf || policy.aiExtraction?.documentUrl} 
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Poliçe Belgesi"
          />
        </div>
      )}
      </div>

    </div>
  );
}
