"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Policy } from "@/types/policy";
import { ComparisonTable } from "@/components/comparison/ComparisonTable";

export default function PublicComparePage({ params }: { params: Promise<{ token: string }> }) {
  const unwrappedParams = use(params);
  const { token } = unwrappedParams;

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/comparisons/${token}`);
        const data = await res.json();

        if (data.success) {
          setPolicies(data.data.policies);
          setExpiresAt(data.data.expiresAt);
        } else {
          setError(data.error || "Link geçersiz.");
        }
      } catch {
        setError("Yükleme hatası.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: "center" }}>Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2>Link Geçersiz</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1>Poliçe Karşılaştırma</h1>
        {expiresAt && (
          <p style={{ color: "var(--text-tertiary)", fontSize: 14 }}>
            Bu link {new Date(expiresAt).toLocaleString("tr-TR")} tarihine kadar geçerlidir.
          </p>
        )}
      </div>
      <ComparisonTable policies={policies} />
    </div>
  );
}
