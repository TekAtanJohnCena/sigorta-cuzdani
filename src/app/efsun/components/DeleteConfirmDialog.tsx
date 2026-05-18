"use client";

import { useState } from "react";
import { deleteCompany } from "@/hooks/useCompanyActions";
import { toast } from "@/lib/toast";

interface Props {
  isOpen: boolean;
  companyName: string;
  tenantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmDialog({ isOpen, companyName, tenantId, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const isConfirmed = confirmText === "SIL";

  async function handleDelete() {
    if (!isConfirmed) return;

    setLoading(true);

    try {
      const result = await deleteCompany(tenantId);

      if (result.success) {
        toast.success("Şirket başarıyla silindi!");
        setConfirmText("");
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Şirket silinirken hata oluştu.");
      }
    } catch (err) {
      toast.error("Sunucu hatası. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
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
          maxWidth: 500,
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #334155" }}>
          <div style={{ fontSize: 48, textAlign: "center", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "white", textAlign: "center" }}>Şirketi Sil</h2>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "#64748b", textAlign: "center" }}>Bu işlem geri alınamaz!</p>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          <div
            style={{
              background: "#450a0a",
              border: "1px solid #991b1b",
              borderRadius: 12,
              padding: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#fca5a5", lineHeight: 1.6 }}>
              <strong>{companyName}</strong> şirketini silmek üzeresiniz. Bu işlem şirketin tüm verilerini, kullanıcılarını ve poliçelerini kalıcı olarak silecektir.
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>
              Silmek için <strong>"SIL"</strong> yazın:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="SIL"
              autoFocus
              style={{
                width: "100%",
                background: "#0f172a",
                border: "1.5px solid #334155",
                borderRadius: 8,
                padding: "0.75rem",
                color: "white",
                fontSize: "0.95rem",
                outline: "none",
                textAlign: "center",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "0 1.5rem 1.5rem", display: "flex", gap: "0.75rem" }}>
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
            type="button"
            onClick={handleDelete}
            disabled={loading || !isConfirmed}
            style={{
              flex: 1,
              background: loading || !isConfirmed ? "#64748b" : "linear-gradient(135deg, #dc2626, #991b1b)",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "0.875rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: loading || !isConfirmed ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Siliniyor..." : "Şirketi Sil"}
          </button>
        </div>
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
