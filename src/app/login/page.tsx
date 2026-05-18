"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const router = useRouter();
  const { expiredMessage } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr.code === "auth/user-not-found" || fbErr.code === "auth/wrong-password" || fbErr.code === "auth/invalid-credential") {
        setError("E-posta veya şifre hatalı.");
      } else {
        setError(fbErr.message || "Bir hata oluştu.");
      }
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
      setResetLoading(false);
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr.code === "auth/user-not-found") {
        setResetError("Bu e-posta adresi bulunamadı.");
      } else {
        setResetError(fbErr.message || "Bir hata oluştu.");
      }
      setResetLoading(false);
    }
  };

  const openResetModal = () => {
    setShowResetModal(true);
    setResetEmail("");
    setResetError(null);
    setResetSuccess(false);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail("");
    setResetError(null);
    setResetSuccess(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--background)",
      padding: "16px"
    }}>
      <div className="card" style={{
        maxWidth: 400,
        width: "100%",
        padding: "clamp(1.5rem, 5vw, 2rem)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 1.875rem)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Sigorta Cüzdanı
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "clamp(0.875rem, 3vw, 1rem)" }}>
            Kurumsal panelinize giriş yapın
          </p>
        </div>

        {expiredMessage && (
          <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: "0.875rem 1rem", color: "#fca5a5", fontSize: "0.875rem", marginBottom: "var(--space-4)", lineHeight: 1.5 }}>
            🔒 <strong>Abonelik Sona Erdi</strong><br />{expiredMessage}
          </div>
        )}

        {error && (
          <div className="toast toast-error" style={{ position: "relative", marginBottom: "var(--space-4)", right: 'auto', bottom: 'auto', maxWidth: '100%' }}>
            <div className="toast-message">
              <div className="toast-description">{error}</div>
            </div>
          </div>
        )}



        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
              Kurumsal E-posta
            </label>
            <input
              type="email"
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
                Şifre
              </label>
              <button
                type="button"
                onClick={openResetModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary-600)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "none"
                }}
              >
                Şifremi Unuttum
              </button>
            </div>
            <input
              type="password"
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: "var(--space-2)" }}
            disabled={loading}
          >
            {loading ? "Lütfen Bekleyin..." : "Giriş Yap"}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-6)", textAlign: "center", fontSize: "var(--text-sm)" }}>
          Hesabınız yok mu? <Link href="/demo/request" style={{ color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}>Demo Talep Edin</Link>
        </div>

        <div style={{ marginTop: "var(--space-6)", textAlign: "center", fontSize: "var(--text-sm)" }}>
          <Link href="/" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>← Ana Sayfaya Dön</Link>
        </div>
      </div>

      {/* Şifre Sıfırlama Modal */}
      {showResetModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-4)",
            zIndex: 50
          }}
          onClick={closeResetModal}
        >
          <div
            className="card"
            style={{
              maxWidth: 400,
              width: "100%",
              padding: "var(--space-6)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
              Şifrenizi Sıfırlayın
            </h2>

            {resetSuccess ? (
              <div>
                <div className="toast toast-success" style={{ position: "relative", marginBottom: "var(--space-4)", right: 'auto', bottom: 'auto', maxWidth: '100%' }}>
                  <div className="toast-message">
                    <div className="toast-description">
                      Şifre sıfırlama bağlantısı e-postanıza gönderildi. Lütfen e-postanızı kontrol edin.
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeResetModal}
                  className="btn btn-secondary w-full"
                  style={{ marginTop: "var(--space-4)" }}
                >
                  Kapat
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {resetError && (
                  <div className="toast toast-error" style={{ position: "relative", right: 'auto', bottom: 'auto', maxWidth: '100%' }}>
                    <div className="toast-message">
                      <div className="toast-description">{resetError}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    className="input w-full"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="ornek@firma.com"
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                  <button
                    type="button"
                    onClick={closeResetModal}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    disabled={resetLoading}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Gönderiliyor..." : "Gönder"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
