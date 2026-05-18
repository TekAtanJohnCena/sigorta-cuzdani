"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Tenant, TenantStats } from "@/types/admin";
import { getToken, adminHeaders } from "@/hooks/useAdminAuth";
import ExtendSubscriptionModal from "../components/ExtendSubscriptionModal";

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function EfsunTenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [error, setError] = useState("");
  const [showExtendModal, setShowExtendModal] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("emre_admin_token");
    if (!token) {
      router.push("/efsun");
      return;
    }
    loadTenantData();
  }, [tenantId]);

  async function loadTenantData() {
    setLoading(true);
    setError("");

    try {
      // Fetch all tenants
      const tenantsRes = await fetch("/api/admin/tenants", {
        headers: adminHeaders(),
      });
      const tenantsData = await tenantsRes.json();

      if (!tenantsData.success) {
        setError("Tenant bilgileri yüklenemedi.");
        return;
      }

      const foundTenant = tenantsData.data.find((t: Tenant) => t.id === tenantId);
      if (!foundTenant) {
        setError("Şirket bulunamadı.");
        return;
      }

      setTenant(foundTenant);

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: adminHeaders(),
      });
      const statsData = await statsRes.json();

      if (statsData.success) {
        const tenantStat = statsData.data.tenantStats.find((s: { tenantId: string }) => s.tenantId === tenantId);
        if (tenantStat) {
          setStats({
            policyCount: tenantStat.policyCount,
            userCount: tenantStat.userCount,
            lastLogin: tenantStat.lastLogin,
          });
        }
      }
    } catch (err) {
      console.error("Data loading error:", err);
      setError("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>{error || "Şirket bulunamadı"}</div>
          <button onClick={() => router.push("/efsun")} style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 8, padding: "0.75rem 1.5rem", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600, marginTop: 16 }}>
            ← Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const left = daysLeft(tenant.endDate);
  const expired = left <= 0;
  const urgent = left > 0 && left <= 7;

  async function handleExtendSuccess() {
    setShowExtendModal(false);
    await loadTenantData();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/efsun")} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.875rem" }}>
            ← Geri
          </button>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{tenant.companyName}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Şirket Detayları</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={() => setShowExtendModal(true)} style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "white", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
            Süre Uzat
          </button>
          <button onClick={() => router.push("/efsun")} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.875rem" }}>
            Panele Dön
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Poliçe Sayısı</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#3b82f6" }}>{stats?.policyCount ?? 0}</div>
          </div>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Kullanıcı Sayısı</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{stats?.userCount ?? 0}</div>
          </div>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Kalan Süre</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: expired ? "#ef4444" : urgent ? "#f59e0b" : "#22c55e" }}>{expired ? "0" : left} gün</div>
          </div>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Durum</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: expired ? "#ef4444" : "#22c55e", marginTop: 8 }}>
              {expired ? "Süresi Doldu" : "Aktif"}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, overflow: "hidden", marginBottom: "2rem" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #334155" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Şirket Bilgileri</h2>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "1rem", fontSize: "0.875rem" }}>
              <div style={{ color: "#64748b", fontWeight: 600 }}>Şirket Adı:</div>
              <div style={{ fontWeight: 600 }}>{tenant.companyName}</div>

              <div style={{ color: "#64748b", fontWeight: 600 }}>E-posta:</div>
              <div>{tenant.email}</div>

              <div style={{ color: "#64748b", fontWeight: 600 }}>Paket Tipi:</div>
              <div>
                <span style={{ background: "#334155", borderRadius: 99, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
                  {tenant.packageType}
                </span>
              </div>

              <div style={{ color: "#64748b", fontWeight: 600 }}>Başlangıç Tarihi:</div>
              <div>{tenant.startDate ? new Date(tenant.startDate).toLocaleDateString("tr-TR") : "—"}</div>

              <div style={{ color: "#64748b", fontWeight: 600 }}>Bitiş Tarihi:</div>
              <div>{tenant.endDate ? new Date(tenant.endDate).toLocaleDateString("tr-TR") : "—"}</div>

              <div style={{ color: "#64748b", fontWeight: 600 }}>Süre:</div>
              <div>{tenant.durationDays ? `${tenant.durationDays} gün` : "—"}</div>

              {stats?.lastLogin && (
                <>
                  <div style={{ color: "#64748b", fontWeight: 600 }}>Son Giriş:</div>
                  <div>{new Date(stats.lastLogin).toLocaleString("tr-TR")}</div>
                </>
              )}

              {tenant.notes && (
                <>
                  <div style={{ color: "#64748b", fontWeight: 600 }}>Notlar:</div>
                  <div style={{ color: "#94a3b8" }}>{tenant.notes}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #334155" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Hesap Durumu</h2>
          </div>
          <div style={{ padding: "1.5rem" }}>
            {expired ? (
              <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: 12, padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 32 }}>⚠️</div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fca5a5", marginBottom: 4 }}>Hesap Süresi Dolmuş</div>
                  <div style={{ fontSize: "0.875rem", color: "#fca5a5" }}>Bu şirketin erişim süresi sona ermiştir. Kullanıcılar sisteme giriş yapamaz.</div>
                </div>
              </div>
            ) : urgent ? (
              <div style={{ background: "#451a03", border: "1px solid #92400e", borderRadius: 12, padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 32 }}>⏰</div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fdba74", marginBottom: 4 }}>Hesap Süresi Yakında Dolacak</div>
                  <div style={{ fontSize: "0.875rem", color: "#fdba74" }}>Bu şirketin hesabının süresinin dolmasına {left} gün kaldı.</div>
                </div>
              </div>
            ) : (
              <div style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 12, padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 32 }}>✅</div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#86efac", marginBottom: 4 }}>Hesap Aktif</div>
                  <div style={{ fontSize: "0.875rem", color: "#86efac" }}>Bu şirketin hesabı aktif durumda. Kalan süre: {left} gün.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extend Modal */}
      <ExtendSubscriptionModal isOpen={showExtendModal} companyName={tenant.companyName} tenantId={tenant.id} currentEndDate={tenant.endDate} onClose={() => setShowExtendModal(false)} onSuccess={handleExtendSuccess} />
    </div>
  );
}
