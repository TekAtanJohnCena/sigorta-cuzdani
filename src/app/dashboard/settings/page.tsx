"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

export default function SettingsPage() {
  const { appUser } = useAuth();
  
  // Profil
  const [companyName, setCompanyName] = useState("");
  const [userName, setUserName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Bildirim Ayarları
  const [notifications, setNotifications] = useState([
    { id: "email", label: "E-posta bildirimleri", desc: "Vade ve ödeme hatırlatmaları", checked: true },
    { id: "due", label: "Vadesi dolacak poliçeler", desc: "30, 15, 7 ve 1 gün kala uyarı", checked: true },
    { id: "installment", label: "Taksit hatırlatmaları", desc: "7 ve 3 gün kala bildirim", checked: true },
    { id: "risk", label: "Risk analizi raporları", desc: "Haftalık risk özeti e-postası", checked: false },
  ]);

  useEffect(() => {
    if (appUser) {
      setCompanyName(appUser.companyName || "");
      setUserName(appUser.name || "");
    }
  }, [appUser]);

  const handleSaveProfile = async () => {
    if (!appUser) return;
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "users", appUser.uid), {
        companyName,
        name: userName
      });
      setMessage({ text: "Profil bilgileriniz başarıyla güncellendi.", type: "success" });
    } catch (err: unknown) {
      setMessage({ text: "Güncelleme başarısız: " + (err as Error).message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, checked: !n.checked } : n));
  };

  if (!appUser) return <div style={{ padding: "var(--space-6)" }}>Yükleniyor...</div>;

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="page-title">Ayarlar</h1>
        <p className="page-subtitle">Hesap bilgileri ve uygulama yapılandırması</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: 700 }}>
        
        {message.text && (
          <div className={`toast toast-${message.type}`} style={{ position: "relative", right: "auto", bottom: "auto", maxWidth: "100%" }}>
            <div className="toast-message">{message.text}</div>
          </div>
        )}

        {/* Profil Bilgileri */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "var(--space-5)" }}>
            👤 Profil & Şirket Bilgileri
          </div>
          <div className="auth-form" style={{ gap: "var(--space-4)" }}>
            <div className="input-group">
              <label className="input-label">E-posta Adresi (Sistem Girişi)</label>
              <input className="input" defaultValue={appUser.email} disabled style={{ opacity: 0.7 }} />
            </div>
            
            <div className="input-group">
              <label className="input-label">Ad Soyad</label>
              <input className="input" value={userName} onChange={e => setUserName(e.target.value)} />
            </div>

            {appUser.role === "admin" && (
              <div className="input-group">
                <label className="input-label">Şirket Ünvanı</label>
                <input className="input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Şirket isminiz" />
              </div>
            )}

            <button className="btn btn-primary" style={{ alignSelf: "flex-end", marginTop: "var(--space-2)" }} onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </div>

        {/* Kurumsal Ayarlar (Sadece Admin) */}
        {appUser.role === "admin" && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: "var(--space-5)" }}>
               🏢 Kurumsal Yapılandırma
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
               Bu bölümde takım üyeleri, tenant konfigürasyonları gibi yönetimsel özellikleri ayarlayabilirsiniz.
            </div>
            <a href="/dashboard/users" className="btn btn-secondary" style={{ display: "inline-flex", textDecoration: "none" }}>
               👥 Personel Yönetimine Git
            </a>
          </div>
        )}

        {/* Notifications */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "var(--space-5)" }}>
            🔔 Bildirim Tercihleri
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--neutral-50)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{item.label}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{item.desc}</div>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: 44, height: 24 }}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggleNotification(item.id)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span
                    style={{
                      position: "absolute",
                      cursor: "pointer",
                      inset: 0,
                      background: item.checked ? "var(--primary-500)" : "var(--neutral-300)",
                      borderRadius: "var(--radius-full)",
                      transition: "var(--transition-fast)",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        height: 18,
                        width: 18,
                        left: item.checked ? 22 : 3,
                        bottom: 3,
                        background: "white",
                        borderRadius: "50%",
                        transition: "var(--transition-fast)",
                      }}
                    />
                  </span>
                </label>
              </div>
            ))}
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-2)" }}>
               * Bildirim tercihleri yerel olarak kaydedilir ve güncel sürümlerde e-posta entegrasyonu ile aktifleşecektir.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
