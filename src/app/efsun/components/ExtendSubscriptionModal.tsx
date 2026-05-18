"use client";

import { useState } from "react";
import { extendSubscription } from "@/hooks/useCompanyActions";
import { toast } from "@/lib/toast";

interface Props {
  isOpen: boolean;
  companyName: string;
  tenantId: string;
  currentEndDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExtendSubscriptionModal({ isOpen, companyName, tenantId, currentEndDate, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function calculateNewEndDate(): string {
    const now = new Date();
    const current = new Date(currentEndDate);
    const baseDate = current > now ? current : now;
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + durationDays);
    return newDate.toLocaleDateString("tr-TR");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (durationDays < 1) {
      setError("Süre en az 1 gün olmalıdır.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await extendSubscription({ tenantId, durationDays });

      if (result.success) {
        toast.success(`Abonelik ${durationDays} gün uzatıldı!`);
        setDurationDays(30);
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Abonelik uzatılırken hata oluştu.");
      }
    } catch (err) {
      toast.error("Sunucu hatası. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  }

  const quickOptions = [7, 30, 60, 90, 180, 365];

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
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "white" }}>Abonelik Süresini Uzat</h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>{companyName}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
          {/* Current Info */}
          <div
            style={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 12,
              padding: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "0.5rem", fontSize: "0.875rem" }}>
              <div style={{ color: "#64748b", fontWeight: 600 }}>Mevcut Bitiş:</div>
              <div style={{ color: "white", fontWeight: 600 }}>{new Date(currentEndDate).toLocaleDateString("tr-TR")}</div>

              <div style={{ color: "#64748b", fontWeight: 600 }}>Yeni Bitiş:</div>
              <div style={{ color: "#22c55e", fontWeight: 700 }}>{calculateNewEndDate()}</div>
            </div>
          </div>

          {/* Quick Options */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.75rem" }}>Hızlı Seçenekler</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
              {quickOptions.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    setDurationDays(days);
                    setError("");
                  }}
                  style={{
                    background: durationDays === days ? "linear-gradient(135deg, #3b55e6, #7c3aed)" : "#334155",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.625rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {days} gün
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>
              Özel Süre (Gün)
            </label>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => {
                setDurationDays(parseInt(e.target.value) || 0);
                setError("");
              }}
              min="1"
              required
              style={{
                width: "100%",
                background: "#0f172a",
                border: `1.5px solid ${error ? "#ef4444" : "#334155"}`,
                borderRadius: 8,
                padding: "0.75rem",
                color: "white",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            {error && <p style={{ color: "#fca5a5", fontSize: "0.75rem", marginTop: "0.25rem", margin: 0 }}>{error}</p>}
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
              {loading ? "Uzatılıyor..." : "Süreyi Uzat"}
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
