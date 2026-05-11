"use client";

import { useState, useEffect, useCallback } from "react";

// ─── NOT ──────────────────────────────────────────────────────────────────────
// createUserWithEmailAndPassword KALDIRILDI (Sorun 5):
//   - Otomatik sign-in yapıyordu → admin session bozuluyordu
//   - Client-side'dan çağrılabilir → güvenlik açığı
// Tüm tenant CRUD işlemleri artık /api/admin/tenants API'si üzerinden yapılıyor.
// ─────────────────────────────────────────────────────────────────────────────

interface Tenant {
  id: string;
  companyName: string;
  email: string;
  packageType: string;
  endDate: string;
  durationDays?: number;
  notes?: string;
  isActive?: boolean;
}

const PACKAGE_LABELS: Record<string, string> = {
  demo: "Demo",
  monthly: "Aylık",
  yearly: "Yıllık",
};

const PACKAGE_DAYS: Record<string, number> = {
  demo: 7,
  monthly: 30,
  yearly: 365,
};

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Token'ı sessionStorage'dan al */
function getToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("emre_admin_token") || "";
}

/** Admin API istekleri için standart headers */
function adminHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-token": getToken(),
  };
}

export default function EmreAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);

  // New tenant form
  const [form, setForm] = useState({
    companyName: "", email: "", password: "", packageType: "demo", durationDays: "7", notes: ""
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Edit modal
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [editDays, setEditDays] = useState("30");

  // ── API: Tenant listesini çek (Sorun 7: artık server-side Admin SDK ile)
  const loadTenants = useCallback(async () => {
    setTenantsLoading(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        headers: adminHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setTenants(data.data as Tenant[]);
      } else {
        console.error("Tenant yükleme hatası:", data.error);
      }
    } catch (err) {
      console.error("loadTenants:", err);
    } finally {
      setTenantsLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("emre_admin_token");
    if (stored) { setAuthed(true); loadTenants(); }
  }, [loadTenants]);

  // ── LOGIN (Sorun 4: Cookie + sessionStorage)
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("emre_admin_token", data.token);
        // Cookie set — proxy/middleware token'ı görebilsin (Sorun 4)
        document.cookie = `admin_token=${data.token}; path=/; max-age=14400; SameSite=Strict`;
        setAuthed(true);
        loadTenants();
      } else {
        setLoginError(data.error || "Hatalı giriş.");
      }
    } catch {
      setLoginError("Sunucu hatası.");
    } finally {
      setLoginLoading(false);
    }
  }

  // ── LOGOUT
  function handleLogout() {
    sessionStorage.removeItem("emre_admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    setAuthed(false);
  }

  // ── YENİ TENANT EKLE (Sorun 5 & 7: tamamen server-side, Admin SDK)
  async function handleAddTenant(e: React.FormEvent) {
    e.preventDefault();
    setFormError(""); setFormSuccess(""); setFormLoading(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          packageType: form.packageType,
          durationDays: parseInt(form.durationDays),
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess(`✅ ${form.companyName} başarıyla eklendi. Giriş: ${form.email}`);
        setForm({ companyName: "", email: "", password: "", packageType: "demo", durationDays: "7", notes: "" });
        loadTenants();
      } else {
        setFormError(data.error || "Hata oluştu.");
      }
    } catch {
      setFormError("Sunucu hatası.");
    } finally {
      setFormLoading(false);
    }
  }

  // ── SÜRE UZAT (Sorun 7: server-side API)
  async function handleExtend(tenant: Tenant, days: number) {
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({ tenantId: tenant.id, durationDays: days }),
      });
      const data = await res.json();
      if (data.success) {
        loadTenants();
        setEditTenant(null);
      } else {
        alert("Hata: " + data.error);
      }
    } catch {
      alert("Sunucu hatası.");
    }
  }

  // ── TENANT SİL (Sorun 7: server-side API)
  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" şirketini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/tenants?tenantId=${id}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        loadTenants();
      } else {
        alert("Hata: " + data.error);
      }
    } catch {
      alert("Sunucu hatası.");
    }
  }

  // ── LOGIN SCREEN ──
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🛡️</div>
            <h1 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Sigorta Cüzdanı</h1>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: 4 }}>Yönetici Paneli</p>
          </div>
          {loginError && (
            <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: "0.75rem 1rem", color: "#fca5a5", fontSize: "0.875rem", marginBottom: "1rem" }}>
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text" placeholder="Kullanıcı Adı" value={username}
              onChange={e => setUsername(e.target.value)} required
              style={{ background: "#0f172a", border: "1.5px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "white", fontSize: "0.95rem", outline: "none" }}
            />
            <input
              type="password" placeholder="Şifre" value={password}
              onChange={e => setPassword(e.target.value)} required
              style={{ background: "#0f172a", border: "1.5px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "white", fontSize: "0.95rem", outline: "none" }}
            />
            <button type="submit" disabled={loginLoading}
              style={{ background: "linear-gradient(135deg, #3b55e6, #7c3aed)", color: "white", border: "none", borderRadius: 8, padding: "0.875rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
              {loginLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── ADMIN DASHBOARD ──
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Sigorta Cüzdanı</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Süper Yönetici Paneli</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.875rem" }}>
          Çıkış Yap
        </button>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Toplam Şirket", value: tenants.length, color: "#3b82f6" },
            { label: "Aktif", value: tenants.filter(t => daysLeft(t.endDate) > 0).length, color: "#22c55e" },
            { label: "Süresi Dolmuş", value: tenants.filter(t => daysLeft(t.endDate) <= 0).length, color: "#ef4444" },
          ].map(s => (
            <div key={s.label} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>

          {/* Tenant List */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Kayıtlı Şirketler</h2>
              <button onClick={loadTenants} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 6, padding: "0.375rem 0.75rem", cursor: "pointer", fontSize: "0.8rem" }}>
                🔄 Yenile
              </button>
            </div>

            {tenantsLoading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Yükleniyor...</div>
            ) : tenants.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Henüz kayıtlı şirket yok.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f172a" }}>
                    {["Şirket", "E-posta", "Paket", "Bitiş", "Durum", ""].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t: Tenant) => {
                    const left = daysLeft(t.endDate);
                    const expired = left <= 0;
                    const urgent = left > 0 && left <= 7;
                    return (
                      <tr key={t.id} style={{ borderTop: "1px solid #334155" }}>
                        <td style={{ padding: "0.875rem 1rem", fontWeight: 600, fontSize: "0.875rem" }}>{t.companyName}</td>
                        <td style={{ padding: "0.875rem 1rem", color: "#94a3b8", fontSize: "0.8rem" }}>{t.email}</td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span style={{ background: "#334155", borderRadius: 99, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }}>
                            {PACKAGE_LABELS[t.packageType] || t.packageType}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                          {t.endDate ? new Date(t.endDate).toLocaleDateString("tr-TR") : "—"}
                        </td>
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
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => { setEditTenant(t); setEditDays("30"); }}
                              style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem" }}>
                              ✏️ Uzat
                            </button>
                            <button onClick={() => handleDelete(t.id, t.companyName)}
                              style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem" }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Add Tenant Form */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700 }}>➕ Yeni Şirket Ekle</h2>

            {formError && <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: "0.75rem", color: "#fca5a5", fontSize: "0.8rem", marginBottom: "1rem" }}>{formError}</div>}
            {formSuccess && <div style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 8, padding: "0.75rem", color: "#86efac", fontSize: "0.8rem", marginBottom: "1rem" }}>{formSuccess}</div>}

            <form onSubmit={handleAddTenant} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { label: "Şirket Adı", key: "companyName", type: "text", placeholder: "Örn: ABC Teknoloji A.Ş." },
                { label: "E-posta", key: "email", type: "email", placeholder: "firma@example.com" },
                { label: "Şifre", key: "password", type: "password", placeholder: "Giriş şifresi" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={String((form as Record<string, unknown>)[f.key] || '')} required
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: "100%", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 8, padding: "0.625rem 0.875rem", color: "white", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>Paket Tipi</label>
                <select value={form.packageType}
                  onChange={e => {
                    const pkg = e.target.value;
                    setForm(prev => ({ ...prev, packageType: pkg, durationDays: String(PACKAGE_DAYS[pkg] || 30) }));
                  }}
                  style={{ width: "100%", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 8, padding: "0.625rem 0.875rem", color: "white", fontSize: "0.875rem", outline: "none" }}>
                  <option value="demo">Demo (7 gün)</option>
                  <option value="monthly">Aylık (30 gün)</option>
                  <option value="yearly">Yıllık (365 gün)</option>
                  <option value="custom">Özel</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>Süre (Gün)</label>
                <input type="number" min="1" max="3650" value={form.durationDays}
                  onChange={e => setForm(prev => ({ ...prev, durationDays: e.target.value }))}
                  style={{ width: "100%", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 8, padding: "0.625rem 0.875rem", color: "white", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>Notlar (İsteğe Bağlı)</label>
                <textarea value={form.notes} placeholder="İletişim notu, satış detayı..."
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} rows={2}
                  style={{ width: "100%", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 8, padding: "0.625rem 0.875rem", color: "white", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>

              <button type="submit" disabled={formLoading}
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none", borderRadius: 8, padding: "0.75rem", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
                {formLoading ? "Ekleniyor..." : "✅ Şirketi Sisteme Ekle"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editTenant && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={() => setEditTenant(null)}>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2rem", width: 360 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem", color: "white" }}>📅 Süre Uzat — {editTenant.companyName}</h3>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 6 }}>Kaç gün eklensin?</label>
            <input type="number" min="1" value={editDays} onChange={e => setEditDays(e.target.value)}
              style={{ width: "100%", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 8, padding: "0.625rem 0.875rem", color: "white", fontSize: "0.95rem", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
              <button onClick={() => handleExtend(editTenant, parseInt(editDays))}
                style={{ flex: 1, background: "#1d4ed8", color: "white", border: "none", borderRadius: 8, padding: "0.75rem", cursor: "pointer", fontWeight: 700 }}>
                Uzat
              </button>
              <button onClick={() => setEditTenant(null)}
                style={{ flex: 1, background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: "0.75rem", cursor: "pointer" }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
