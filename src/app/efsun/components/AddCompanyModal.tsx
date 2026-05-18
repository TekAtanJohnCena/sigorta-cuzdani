"use client";

import { useState } from "react";
import { createCompany } from "@/hooks/useCompanyActions";
import { toast } from "@/lib/toast";
import { CreateTenantRequest, ValidationError } from "@/types/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCompanyModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTenantRequest>({
    companyName: "",
    email: "",
    password: "",
    packageType: "demo",
    durationDays: 7,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Şirket adı en az 2 karakter olmalıdır.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz.";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır.";
    }

    if (formData.durationDays < 1) {
      newErrors.durationDays = "Süre en az 1 gün olmalıdır.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen tüm alanları doğru doldurunuz.");
      return;
    }

    setLoading(true);

    try {
      const result = await createCompany(formData);

      if (result.success) {
        toast.success("Şirket başarıyla eklendi!");
        setFormData({
          companyName: "",
          email: "",
          password: "",
          packageType: "demo",
          durationDays: 7,
          notes: "",
        });
        setErrors({});
        onSuccess();
        onClose();
      } else {
        if (result.error?.includes("already-exists") || result.error?.includes("email-already-in-use")) {
          toast.error("Bu e-posta adresi zaten kullanılmaktadır.");
        } else {
          toast.error(result.error || "Şirket eklenirken hata oluştu.");
        }
      }
    } catch (err) {
      toast.error("Sunucu hatası. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof CreateTenantRequest, value: string | number) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9998,
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 16,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "auto",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "white" }}>Yeni Şirket Ekle</h2>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>Yeni bir demo şirket hesabı oluşturun</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "1.5rem", cursor: "pointer", padding: 0, width: 32, height: 32 }}>
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Company Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>
                Şirket Adı <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Örnek Şirket A.Ş."
                required
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: `1.5px solid ${errors.companyName ? "#ef4444" : "#334155"}`,
                  borderRadius: 8,
                  padding: "0.75rem",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              {errors.companyName && <p style={{ color: "#fca5a5", fontSize: "0.75rem", marginTop: "0.25rem", margin: 0 }}>{errors.companyName}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>
                E-posta <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="admin@ornek.com"
                required
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: `1.5px solid ${errors.email ? "#ef4444" : "#334155"}`,
                  borderRadius: 8,
                  padding: "0.75rem",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              {errors.email && <p style={{ color: "#fca5a5", fontSize: "0.75rem", marginTop: "0.25rem", margin: 0 }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>
                Şifre <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="En az 6 karakter"
                required
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: `1.5px solid ${errors.password ? "#ef4444" : "#334155"}`,
                  borderRadius: 8,
                  padding: "0.75rem",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              {errors.password && <p style={{ color: "#fca5a5", fontSize: "0.75rem", marginTop: "0.25rem", margin: 0 }}>{errors.password}</p>}
            </div>

            {/* Package Type & Duration */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>Paket Tipi</label>
                <select
                  value={formData.packageType}
                  onChange={(e) => handleChange("packageType", e.target.value)}
                  style={{
                    width: "100%",
                    background: "#0f172a",
                    border: "1.5px solid #334155",
                    borderRadius: 8,
                    padding: "0.75rem",
                    color: "white",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                >
                  <option value="demo">Demo</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>
                  Süre (Gün) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => handleChange("durationDays", parseInt(e.target.value) || 0)}
                  min="1"
                  required
                  style={{
                    width: "100%",
                    background: "#0f172a",
                    border: `1.5px solid ${errors.durationDays ? "#ef4444" : "#334155"}`,
                    borderRadius: 8,
                    padding: "0.75rem",
                    color: "white",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
                {errors.durationDays && <p style={{ color: "#fca5a5", fontSize: "0.75rem", marginTop: "0.25rem", margin: 0 }}>{errors.durationDays}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>Notlar (Opsiyonel)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Demo amaçlı hesap..."
                rows={3}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1.5px solid #334155",
                  borderRadius: 8,
                  padding: "0.75rem",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                background: "#334155",
                color: "#94a3b8",
                border: "none",
                borderRadius: 8,
                padding: "0.875rem",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: loading ? "#64748b" : "linear-gradient(135deg, #3b55e6, #7c3aed)",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "0.875rem",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Ekleniyor..." : "Şirket Ekle"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
