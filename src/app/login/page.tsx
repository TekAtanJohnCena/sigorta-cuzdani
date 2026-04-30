"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--background)",
      padding: "var(--space-4)"
    }}>
      <div className="card" style={{
        maxWidth: 400,
        width: "100%",
        padding: "var(--space-8)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Sigorta Cüzdanı
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
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
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
              Şifre
            </label>
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
    </div>
  );
}
