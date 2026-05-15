"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { usePolicies } from "@/lib/hooks/usePolicies";
import { Policy } from "@/types/policy";
import { ComparisonTable } from "@/components/comparison/ComparisonTable";
import { formatCurrency } from "@/lib/utils/currency";

export default function ComparePage() {
  const { user, appUser } = useAuth();
  const { policies, loading } = usePolicies(appUser?.tenantId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparedPolicies, setComparedPolicies] = useState<Policy[]>([]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [comparisonId, setComparisonId] = useState<string | null>(null);

  const handleCompare = async () => {
    if (selectedIds.length < 2 || selectedIds.length > 4) {
      alert("2-4 arası poliçe seçiniz.");
      return;
    }

    setIsComparing(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/comparisons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ policyIds: selectedIds }),
      });

      const data = await res.json();
      if (data.success) {
        setComparedPolicies(data.data.policies);
        setComparisonId(data.data.comparisonId);
      } else {
        alert(data.error || "Karşılaştırma başarısız.");
      }
    } catch {
      alert("Bir hata oluştu.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleShare = async () => {
    if (!comparisonId) return;

    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/comparisons/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comparisonId, policyIds: selectedIds }),
      });

      const data = await res.json();
      if (data.success) {
        setShareUrl(data.data.shareUrl);
        navigator.clipboard.writeText(data.data.shareUrl);
        alert("Link kopyalandı! 24 saat geçerlidir.");
      }
    } catch {
      alert("Link oluşturulamadı.");
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/comparisons/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ policyIds: selectedIds }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Karsilastirma_${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("PDF oluşturulamadı.");
      }
    } catch {
      alert("Bir hata oluştu.");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Poliçe Karşılaştır</h1>
        <p className="page-subtitle">2-4 arası poliçe seçerek karşılaştırma yapabilirsiniz.</p>
      </div>

      {!comparedPolicies.length ? (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <strong>Seçili Poliçeler: {selectedIds.length}/4</strong>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {policies.map((policy) => (
              <label
                key={policy.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: selectedIds.includes(policy.id) ? "var(--primary-50)" : "white",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(policy.id)}
                  onChange={() => toggleSelection(policy.id)}
                  disabled={!selectedIds.includes(policy.id) && selectedIds.length >= 4}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{policy.policyNumber}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {policy.insuranceCompany} - {formatCurrency(policy.premium.totalPremium)}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || isComparing}
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            {isComparing ? "Yükleniyor..." : "Karşılaştır"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <button onClick={() => { setComparedPolicies([]); setShareUrl(null); }} className="btn btn-secondary">
              ← Yeni Karşılaştırma
            </button>
            <button onClick={handleExportPDF} className="btn btn-secondary">
              📥 PDF İndir
            </button>
            <button onClick={handleShare} className="btn btn-secondary">
              🔗 Paylaş
            </button>
          </div>
          {shareUrl && (
            <div className="card" style={{ padding: 16, marginBottom: 16, background: "var(--success-50)" }}>
              <strong>Paylaşım Linki (24 saat geçerli):</strong>
              <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 13 }}>{shareUrl}</div>
            </div>
          )}
          <ComparisonTable policies={comparedPolicies} />
        </div>
      )}
    </div>
  );
}
