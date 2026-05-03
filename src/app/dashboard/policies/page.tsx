"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { deletePolicy } from "@/lib/firebase/firestore";
import {
  PolicyType,
  PolicyStatus,
  POLICY_TYPE_LABELS,
  POLICY_TYPE_ICONS,
  POLICY_STATUS_LABELS,
} from "@/types/policy";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort, daysUntil, getRelativeTime } from "@/lib/utils/date";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useDemo } from "@/lib/context/DemoContext";
import { MOCK_POLICIES } from "@/lib/mockData";
import { exportPoliciesToCSV } from "@/lib/utils/export";
import { usePolicies } from "@/lib/hooks/usePolicies";
import { TableSkeleton } from "@/components/SkeletonLoader";

const STATUS_BADGE_MAP: Record<PolicyStatus, string> = {
  active: "badge-green badge-dot",
  expired: "badge-red badge-dot",
  cancelled: "badge-gray badge-dot",
  pending_review: "badge-amber badge-dot",
};

export default function PoliciesPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get("status") || "all");
  const [sortBy, setSortBy] = useState<string>("endDate");

  const { appUser } = useAuth();
  const { isDemoMode } = useDemo();

  const { policies: dbPolicies, loading: isLoading, error, refetch } = usePolicies(
    isDemoMode ? null : appUser?.tenantId
  );

  const effectivePolicies = isDemoMode ? MOCK_POLICIES : dbPolicies;

  const filteredPolicies = useMemo(() => {
    let result = [...effectivePolicies];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.policyNumber.toLowerCase().includes(q) ||
          p.insuranceCompany.toLowerCase().includes(q) ||
          POLICY_TYPE_LABELS[p.policyType].toLowerCase().includes(q) ||
          p.agencyName.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== "all") {
      result = result.filter((p) => p.policyType === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "expiring") {
        result = result.filter((p) => p.status === "active" && daysUntil(p.endDate) <= 90);
      } else {
        result = result.filter((p) => p.status === filterStatus);
      }
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "endDate":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case "premium":
          return b.premium.totalPremium - a.premium.totalPremium;
        case "company":
          return a.insuranceCompany.localeCompare(b.insuranceCompany);
        case "confidence":
          return b.aiExtraction.confidenceScore - a.aiExtraction.confidenceScore;
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, filterType, filterStatus, sortBy, effectivePolicies]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu poliçeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

    if (isDemoMode) {
      alert("Demo modunda poliçe silinemez.");
      return;
    }

    try {
      await deletePolicy(id);
      refetch(); // hook ile listeyi tazele
    } catch {
      alert("Silme işlemi başarısız oldu.");
    }
  };

  const totalPremium = filteredPolicies.reduce(
    (sum, p) => sum + p.premium.totalPremium,
    0
  );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <h1 className="page-title">Poliçeler</h1>
          <p className="page-subtitle">
            {filteredPolicies.length} poliçe · Toplam prim:{" "}
            {formatCurrency(totalPremium)}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button onClick={() => exportPoliciesToCSV(filteredPolicies)} className="btn btn-secondary" disabled={filteredPolicies.length === 0}>
             📥 Dışa Aktar (CSV)
           </button>
           <Link href="/dashboard/upload" className="btn btn-primary">
             📤 Yeni PDF Yükle
           </Link>
        </div>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{
          padding: "var(--space-4)",
          marginBottom: "var(--space-6)",
          display: "flex",
          gap: "var(--space-4)",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div className="input-with-icon" style={{ flex: "1", minWidth: 200 }}>
          <span className="input-icon">🔍</span>
          <input
            type="text"
            className="input"
            placeholder="Poliçe no, şirket veya tür ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="policy-search"
          />
        </div>

        <select
          className="input"
          style={{ width: "auto", minWidth: 160 }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          id="filter-type"
        >
          <option value="all">Tüm Türler</option>
          {Object.entries(POLICY_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {POLICY_TYPE_ICONS[key as PolicyType]} {label}
            </option>
          ))}
        </select>

        <select
          className="input"
          style={{ width: "auto", minWidth: 150 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          id="filter-status"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="expiring">⏰ Yaklaşan Vadeler</option>
          {Object.entries(POLICY_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          className="input"
          style={{ width: "auto", minWidth: 150 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          id="sort-by"
        >
          <option value="endDate">Vade Tarihine Göre</option>
          <option value="premium">Prime Göre</option>
          <option value="company">Şirkete Göre</option>
          <option value="confidence">AI Güvenine Göre</option>
        </select>
      </div>

      {/* Table & Empty States */}
      {isLoading ? (
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <TableSkeleton rows={8} />
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "var(--space-12)", background: "var(--danger-50)", border: "1px solid var(--danger-200)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>⚠️</div>
          <div style={{ fontWeight: 700, color: "var(--danger-800)", marginBottom: "var(--space-2)" }}>Poliçeler Yüklenemedi</div>
          <button className="btn btn-secondary" style={{ marginTop: "var(--space-4)" }} onClick={() => refetch()}>Tekrar Dene</button>
        </div>
      ) : effectivePolicies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">Henüz Poliçe Yok</div>
          <div className="empty-state-description">
            Sisteme kayıtlı hiçbir poliçeniz bulunmuyor. Sol taraftaki butonu kullanarak ilk poliçenizi yükleyebilirsiniz.
          </div>
          <Link href="/dashboard/upload" className="btn btn-primary">
            📤 PDF Yükle
          </Link>
        </div>
      ) : (
        <>
          {filteredPolicies.length > 0 && (
            <>
            <div className="table-wrapper">
            <table className="table table-clickable">
          <thead>
            <tr>
              <th>Tür</th>
              <th>Poliçe No</th>
              <th>Sigorta Şirketi</th>
              <th>Vade Bitiş</th>
              <th>Toplam Prim</th>
              <th>AI Güveni</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPolicies.map((policy) => {
              const days = daysUntil(policy.endDate);
              const isExpiring = days >= 0 && days <= 30;
              return (
                <tr key={policy.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>
                        {POLICY_TYPE_ICONS[policy.policyType]}
                      </span>
                      <span style={{ fontWeight: 500 }}>
                        {POLICY_TYPE_LABELS[policy.policyType]}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 500,
                      }}
                    >
                      {policy.policyNumber}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {policy.insuranceCompany}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {policy.agencyName}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {formatDateShort(policy.endDate)}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: isExpiring
                            ? "var(--danger-500)"
                            : "var(--text-tertiary)",
                          fontWeight: isExpiring ? 600 : 400,
                        }}
                      >
                        {getRelativeTime(policy.endDate)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>
                      {formatCurrency(policy.premium.totalPremium)}
                    </span>
                    {policy.premium.paymentType === "installment" && (
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {policy.premium.installmentCount || 0} taksit
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="confidence-bar">
                      <div className="confidence-bar-track">
                        <div
                          className={`confidence-bar-fill ${
                            policy.aiExtraction.confidenceScore >= 85
                              ? "high"
                              : policy.aiExtraction.confidenceScore >= 60
                              ? "medium"
                              : "low"
                          }`}
                          style={{
                            width: `${policy.aiExtraction.confidenceScore}%`,
                          }}
                        />
                      </div>
                      <span className="confidence-label">
                        {policy.aiExtraction.confidenceScore}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        STATUS_BADGE_MAP[policy.status]
                      }`}
                    >
                      {POLICY_STATUS_LABELS[policy.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      {policy.documents?.originalPdf && (
                        <a
                          href={policy.documents.originalPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-icon btn-sm"
                          title="PDF Görüntüle"
                          aria-label={`${policy.policyNumber} poliçesinin PDF dosyasını görüntüle`}
                        >
                          📄
                        </a>
                      )}
                      <Link
                        href={`/dashboard/policies/${policy.id}`}
                        className="btn btn-ghost btn-sm"
                        title="Detaylar"
                        aria-label={`${policy.policyNumber} poliçesinin detaylarını görüntüle`}
                      >
                        🔍
                      </Link>
                      <button
                        onClick={() => handleDelete(policy.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger-500)' }}
                        title="Sil"
                        aria-label={`${policy.policyNumber} poliçesini sil`}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {/* Mobile Card List (visible when table is hidden) */}
        <div className="mobile-policy-list" style={{ display: 'none' }}>
          {filteredPolicies.map((policy) => {
            const days = daysUntil(policy.endDate);
            const isExpiring = days >= 0 && days <= 30;
            return (
              <Link
                key={policy.id}
                href={`/dashboard/policies/${policy.id}`}
                className="card"
                style={{
                  marginBottom: 'var(--space-3)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{POLICY_TYPE_ICONS[policy.policyType]}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{POLICY_TYPE_LABELS[policy.policyType]}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {policy.policyNumber}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${STATUS_BADGE_MAP[policy.status]}`}>
                    {POLICY_STATUS_LABELS[policy.status]}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                  <div style={{ fontWeight: 500 }}>{policy.insuranceCompany}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{policy.agencyName}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', fontSize: '0.8125rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Vade Bitiş</div>
                    <div style={{ fontWeight: 500 }}>{formatDateShort(policy.endDate)}</div>
                    <div style={{ fontSize: '0.75rem', color: isExpiring ? 'var(--danger-500)' : 'var(--text-tertiary)', fontWeight: isExpiring ? 600 : 400 }}>
                      {getRelativeTime(policy.endDate)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Toplam Prim</div>
                    <div style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                      {formatCurrency(policy.premium.totalPremium, policy.premium.currency)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        </>
        )}

          
      {effectivePolicies.length > 0 && filteredPolicies.length === 0 && (
        <div className="empty-state" style={{ marginTop: "var(--space-6)" }}>
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Sonuç Bulunamadı</div>
          <div className="empty-state-description">
            Arama kriterlerinize uygun poliçe bulunamadı. Filtreleri temizlemeyi deneyin.
          </div>
          </div>
        )}
        </>
      )}

    </div>
  );
}
