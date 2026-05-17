"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { saveCompanyProfile, getCompanyProfile } from "@/lib/firebase/firestore.client";
import { SECTOR_OPTIONS, SectorKey } from "@/lib/data/sectorInsurance";
import { usePolicies } from "@/lib/hooks/usePolicies";
import { getEmployeesByTenant } from "@/lib/firebase/employees";
import { POLICY_TYPE_LABELS } from "@/types/policy";

export default function SettingsPage() {
  const { appUser } = useAuth();
  const { policies, loading: policiesLoading } = usePolicies(appUser?.tenantId);

  // Profil
  const [companyName, setCompanyName] = useState("");
  const [userName, setUserName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Şirket Profili (Limit Benchmarking & AI Analiz)
  const [sector, setSector] = useState<SectorKey>("genel");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });

  // Veri Dışa Aktarma
  const [exporting, setExporting] = useState<"policies" | "employees" | null>(null);
  
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
      // Şirket profilini yükle
      getCompanyProfile(appUser.tenantId).then(profile => {
        if (profile) {
          setSector((profile.sector as SectorKey) || "genel");
          setAnnualRevenue(profile.annualRevenue ? String(profile.annualRevenue) : "");
          setEmployeeCount(profile.employeeCount ? String(profile.employeeCount) : "");
        }
      }).catch(err => console.error("Failed to load company profile", err));
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

  const handleExportPolicies = async () => {
    if (!appUser) return;
    setExporting("policies");
    try {
      const headers = [
        "Poliçe No",
        "Sigorta Şirketi",
        "Poliçe Tipi",
        "Acente",
        "Başlangıç Tarihi",
        "Bitiş Tarihi",
        "Net Prim (TL)",
        "Toplam Prim (TL)",
        "Durum",
        "Poliçe Sahibi",
        "Sigortalı"
      ];

      const rows = policies.map(p => [
        p.policyNumber,
        p.insuranceCompany,
        POLICY_TYPE_LABELS[p.policyType] || p.policyType,
        p.agencyName,
        new Date(p.startDate).toLocaleDateString("tr-TR"),
        new Date(p.endDate).toLocaleDateString("tr-TR"),
        p.premium.netPremium.toFixed(2),
        p.premium.totalPremium.toFixed(2),
        p.status === "active" ? "Aktif" : p.status === "expired" ? "Süresi Dolmuş" : p.status === "cancelled" ? "İptal" : "İnceleme Bekliyor",
        p.policyHolder.name,
        p.insured.name
      ]);

      const csv = [headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `policeler_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ text: `${policies.length} adet poliçe başarıyla dışa aktarıldı.`, type: "success" });
    } catch (err: unknown) {
      setMessage({ text: "Dışa aktarma başarısız: " + (err as Error).message, type: "error" });
    } finally {
      setExporting(null);
    }
  };

  const handleExportEmployees = async () => {
    if (!appUser) return;
    setExporting("employees");
    try {
      const employees = await getEmployeesByTenant(appUser.tenantId);

      const headers = [
        "Ad Soyad",
        "TC Kimlik",
        "Doğum Tarihi",
        "Departman",
        "Pozisyon",
        "İşe Giriş Tarihi",
        "Durum",
        "Sigorta Durumu",
        "Sigorta Başlangıç Tarihi"
      ];

      const rows = employees.map(e => [
        e.fullName,
        e.tcKimlik || "-",
        e.birthDate ? new Date(e.birthDate).toLocaleDateString("tr-TR") : "-",
        e.department,
        e.position,
        new Date(e.startDate).toLocaleDateString("tr-TR"),
        e.isActive ? "Aktif" : "Pasif",
        e.insuranceStatus === "covered" ? "Kapsam Altında" : e.insuranceStatus === "pending_addition" ? "Ekleme Bekliyor" : e.insuranceStatus === "pending_removal" ? "Çıkarma Bekliyor" : "Kapsamda Değil",
        e.insuranceCoverageStartDate ? new Date(e.insuranceCoverageStartDate).toLocaleDateString("tr-TR") : "-"
      ]);

      const csv = [headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calisanlar_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ text: `${employees.length} adet çalışan başarıyla dışa aktarıldı.`, type: "success" });
    } catch (err: unknown) {
      setMessage({ text: "Dışa aktarma başarısız: " + (err as Error).message, type: "error" });
    } finally {
      setExporting(null);
    }
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

        {/* Şirket Profili — Limit Benchmarking & AI Analiz */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "var(--space-2)" }}>
            📊 Şirket Profili
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginBottom: "var(--space-5)", lineHeight: 1.5 }}>
            Bu bilgiler, Risk Açığı Analizi&apos;nde teminat limitlerinin yeterliliğini ve AI Portföy Analizi&apos;nde şirketinize özel önerileri hesaplamak için kullanılır.
          </div>

          {profileMessage.text && (
            <div className={`toast toast-${profileMessage.type}`} style={{ position: "relative", right: "auto", bottom: "auto", maxWidth: "100%", marginBottom: "var(--space-4)" }}>
              <div className="toast-message">{profileMessage.text}</div>
            </div>
          )}

          <div className="auth-form" style={{ gap: "var(--space-4)" }}>
            <div className="input-group">
              <label className="input-label">Faaliyet Sektörü</label>
              <select className="input" value={sector} onChange={e => setSector(e.target.value as SectorKey)}>
                {SECTOR_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Tahmini Yıllık Ciro (₺)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Örn: 15000000"
                  value={annualRevenue}
                  onChange={e => setAnnualRevenue(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Çalışan Sayısı</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Örn: 25"
                  value={employeeCount}
                  onChange={e => setEmployeeCount(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ alignSelf: "flex-end", marginTop: "var(--space-2)" }}
              disabled={profileSaving}
              onClick={async () => {
                if (!appUser) return;
                setProfileSaving(true);
                setProfileMessage({ text: "", type: "" });
                try {
                  await saveCompanyProfile(appUser.tenantId, {
                    sector,
                    annualRevenue: parseFloat(annualRevenue) || 0,
                    employeeCount: parseInt(employeeCount) || 0,
                  });
                  setProfileMessage({ text: "Şirket profili başarıyla kaydedildi. Risk analizi otomatik güncellenecek.", type: "success" });
                } catch (err: unknown) {
                  setProfileMessage({ text: "Profil kaydedilemedi: " + (err as Error).message, type: "error" });
                } finally {
                  setProfileSaving(false);
                }
              }}
            >
              {profileSaving ? "Kaydediliyor..." : "Profili Kaydet"}
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

        {/* Veri Yönetimi */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "var(--space-2)" }}>
            📦 Veri Yönetimi
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginBottom: "var(--space-5)", lineHeight: 1.5 }}>
            Tüm verilerinizi CSV formatında dışa aktarabilirsiniz. Excel ile açılabilir, vendor lock-in riski yoktur.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--neutral-50)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>Poliçe Verileri</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                  {policiesLoading ? "Yükleniyor..." : `${policies.length} adet poliçe kayıtlı`}
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleExportPolicies}
                disabled={policiesLoading || policies.length === 0 || exporting === "policies"}
                style={{ fontSize: "var(--text-sm)" }}
              >
                {exporting === "policies" ? "Dışa aktarılıyor..." : "CSV İndir"}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--neutral-50)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>Çalışan Verileri</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                  Tüm personel ve sigorta kapsamı bilgileri
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleExportEmployees}
                disabled={exporting === "employees"}
                style={{ fontSize: "var(--text-sm)" }}
              >
                {exporting === "employees" ? "Dışa aktarılıyor..." : "CSV İndir"}
              </button>
            </div>
          </div>

          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-4)", padding: "var(--space-3)", background: "var(--neutral-50)", borderRadius: "var(--radius-md)" }}>
            💡 <strong>Enterprise Uyumluluk:</strong> CSV dosyaları UTF-8 BOM ile kodlanmıştır, Türkçe karakterler Excel&apos;de doğru görünür.
          </div>
        </div>
      </div>
    </div>
  );
}
