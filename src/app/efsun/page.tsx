"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Tenant {
  id: string;
  companyName: string;
  email: string;
  packageType: string;
  endDate: string;
  isActive?: boolean;
  policyCount?: number;
  userCount?: number;
}

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("emre_admin_token") || "";
}

function adminHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-token": getToken(),
  };
}

export default function EfsunAdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("emre_admin_token");
    if (stored) {
      setAuthed(true);
      loadData();
    }
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Fetch tenants
      const tenantsRes = await fetch("/api/admin/tenants", {
        headers: adminHeaders(),
      });
      const tenantsData = await tenantsRes.json();

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: adminHeaders(),
      });
      const statsData = await statsRes.json();

      if (tenantsData.success && statsData.success) {
        const statsMap = new Map<string, { policyCount: number; userCount: number }>(
          statsData.data.tenantStats.map((s: { tenantId: string; policyCount: number; userCount: number }) => [
            s.tenantId,
            { policyCount: s.policyCount, userCount: s.userCount },
          ])
        );

        const enrichedTenants = tenantsData.data.map((t: Tenant) => {
          const stats = statsMap.get(t.id) ?? { policyCount: 0, userCount: 0 };
          return {
            ...t,
            policyCount: stats.policyCount,
            userCount: stats.userCount,
          };
        });

        setTenants(enrichedTenants);
      }
    } catch (err) {
      console.error("Data loading error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("emre_admin_token", data.token);
        document.cookie = `admin_token=${data.token}; path=/; max-age=14400; SameSite=Strict`;
        setAuthed(true);
        loadData();
      } else {
        setLoginError(data.error || "Hatalı giriş.");
      }
    } catch {
      setLoginError("Sunucu hatası.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("emre_admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    setAuthed(false);
  }

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
            <h1 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>EFSUN Admin</h1>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: 4 }}>Sigorta Cüzdanı Yönetim</p>
          </div>
          {loginError && (
            <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: "0.75rem 1rem", color: "#fca5a5", fontSize: "0.875rem", marginBottom: "1rem" }}>
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ background: "#0f172a", border: "1.5px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "white", fontSize: "0.95rem", outline: "none" }}
            />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ background: "#0f172a", border: "1.5px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "white", fontSize: "0.95rem", outline: "none" }}
            />
            <button
              type="submit"
              disabled={loginLoading}
              style={{ background: "linear-gradient(135deg, #3b55e6, #7c3aed)", color: "white", border: "none", borderRadius: 8, padding: "0.875rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}
            >
              {loginLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>EFSUN Admin Panel</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Şirket Yönetimi</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.875rem" }}>
          Çıkış Yap
        </button>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Toplam Şirket</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#3b82f6" }}>{tenants.length}</div>
          </div>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Aktif</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#22c55e" }}>{tenants.filter((t) => daysLeft(t.endDate) > 0).length}</div>
          </div>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Toplam Poliçe</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{tenants.reduce((sum, t) => sum + (t.policyCount || 0), 0)}</div>
          </div>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Toplam Kullanıcı</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#f59e0b" }}>{tenants.reduce((sum, t) => sum + (t.userCount || 0), 0)}</div>
          </div>
        </div>

        {/* Tenant Table */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Kayıtlı Şirketler</h2>
            <button onClick={loadData} disabled={loading} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 6, padding: "0.375rem 0.75rem", cursor: "pointer", fontSize: "0.8rem" }}>
              {loading ? "Yükleniyor..." : "🔄 Yenile"}
            </button>
          </div>

          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Yükleniyor...</div>
          ) : tenants.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Henüz kayıtlı şirket yok.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f172a" }}>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Şirket</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>E-posta</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Paket</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Poliçe</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Kullanıcı</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Durum</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => {
                    const left = daysLeft(t.endDate);
                    const expired = left <= 0;
                    const urgent = left > 0 && left <= 7;
                    return (
                      <tr key={t.id} style={{ borderTop: "1px solid #334155" }}>
                        <td style={{ padding: "0.875rem 1rem", fontWeight: 600, fontSize: "0.875rem" }}>{t.companyName}</td>
                        <td style={{ padding: "0.875rem 1rem", color: "#94a3b8", fontSize: "0.8rem" }}>{t.email}</td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span style={{ background: "#334155", borderRadius: 99, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }}>
                            {t.packageType}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#3b82f6", fontWeight: 700, textAlign: "center" }}>{t.policyCount}</td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#8b5cf6", fontWeight: 700, textAlign: "center" }}>{t.userCount}</td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          {expired ? (
                            <span style={{ background: "#450a0a", color: "#fca5a5", borderRadius: 99, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700 }}>Süresi Doldu</span>
                          ) : urgent ? (
                            <span style={{ background: "#451a03", color: "#fdba74", borderRadius: 99, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700 }}>{left} gün</span>
                          ) : (
                            <span style={{ background: "#052e16", color: "#86efac", borderRadius: 99, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700 }}>{left} gün</span>
                          )}
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <button onClick={() => router.push(`/efsun/${t.id}`)} style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                            Detay →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
