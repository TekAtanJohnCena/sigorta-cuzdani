"use client";

import { useState, useRef } from "react";
import { IMPORTABLE_FIELDS, ColumnMapping } from "@/types/asset";

interface Props {
  tenantId: string;
  companyId: string;
  onClose: () => void;
  onSuccess: (result: { successCount: number; errorCount: number }) => void;
}

type Phase = "upload" | "mapping" | "importing" | "result";

export function BulkImportModal({ tenantId, companyId, onClose, onSuccess }: Props) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [result, setResult] = useState<{ successCount: number; errorCount: number; errors: { row: number; message: string }[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<File | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    fileRef.current = file;
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenantId", tenantId);
    formData.append("companyId", companyId);

    try {
      const res = await fetch("/api/assets/bulk", { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || "Dosya okunamadi");
        return;
      }

      setHeaders(data.data.headers);
      setPreviewRows(data.data.previewRows);
      setTotalRows(data.data.totalRows);
      setMappings(data.data.headers.map((h: string) => ({ sourceColumn: h, targetField: "skip" as const })));
      setPhase("mapping");
    } catch {
      setError("Dosya yuklenirken bir hata olustu");
    } finally {
      setLoading(false);
    }
  }

  function updateMapping(index: number, targetField: string) {
    setMappings(prev => prev.map((m, i) => i === index ? { ...m, targetField: targetField as ColumnMapping["targetField"] } : m));
  }

  async function handleImport() {
    if (!fileRef.current) return;
    setLoading(true);
    setPhase("importing");

    const formData = new FormData();
    formData.append("file", fileRef.current);
    formData.append("tenantId", tenantId);
    formData.append("companyId", companyId);
    formData.append("mapping", JSON.stringify(mappings));

    try {
      const res = await fetch("/api/assets/bulk", { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || "Import basarisiz");
        setPhase("mapping");
        return;
      }

      setResult(data.data);
      setPhase("result");
      onSuccess({ successCount: data.data.successCount, errorCount: data.data.errorCount });
    } catch {
      setError("Import sirasinda hata olustu");
      setPhase("mapping");
    } finally {
      setLoading(false);
    }
  }

  const hasRequiredMappings = mappings.some(m => m.targetField === "name") &&
    mappings.some(m => m.targetField === "category") &&
    mappings.some(m => m.targetField === "estimatedValue");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--bg-primary)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 720, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 700 }}>
            {phase === "upload" && "Excel/CSV Import"}
            {phase === "mapping" && "Kolon Eslestirme"}
            {phase === "importing" && "Import Ediliyor..."}
            {phase === "result" && "Import Tamamlandi"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-secondary)" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          {error && (
            <div style={{ background: "var(--danger-50, #fef2f2)", border: "1px solid var(--danger-200, #fecaca)", borderRadius: "var(--radius-md)", padding: 12, marginBottom: 16, color: "var(--danger-700, #b91c1c)", fontSize: 13 }}>
              {error}
            </div>
          )}

          {phase === "upload" && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: 14 }}>
                Excel (.xlsx) veya CSV dosyanizi secin. Ilk satir baslik satiri olmalidir.
              </p>
              <label style={{ display: "inline-block", padding: "12px 24px", background: "var(--primary-500)", color: "white", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                {loading ? "Okunuyor..." : "Dosya Sec"}
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} style={{ display: "none" }} disabled={loading} />
              </label>
            </div>
          )}

          {phase === "mapping" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                {totalRows} satir bulundu. Her Excel kolonunu ilgili alana esleyin. Zorunlu alanlar: Ad, Kategori, Deger
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {headers.map((header, i) => (
                  <div key={header} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{header}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>→</span>
                    <select
                      value={mappings[i]?.targetField || "skip"}
                      onChange={(e) => updateMapping(i, e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, background: "var(--bg-primary)" }}
                    >
                      <option value="skip">— Atla —</option>
                      {IMPORTABLE_FIELDS.map(f => (
                        <option key={f.field} value={f.field}>{f.label}{f.required ? " *" : ""}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview */}
              {previewRows.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Onizleme (ilk 3 satir):</p>
                  <div style={{ overflowX: "auto", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>{headers.map(h => <th key={h} style={{ padding: "4px 8px", borderBottom: "1px solid var(--border-light)", textAlign: "left" }}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {previewRows.slice(0, 3).map((row, ri) => (
                          <tr key={ri}>{headers.map(h => <td key={h} style={{ padding: "4px 8px", borderBottom: "1px solid var(--border-light)" }}>{String(row[h] ?? "")}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === "importing" && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 16, animation: "pulse-glow 2s ease-in-out infinite" }}>⏳</div>
              <p style={{ fontWeight: 600 }}>{totalRows} varlik import ediliyor...</p>
            </div>
          )}

          {phase === "result" && result && (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{result.errorCount === 0 ? "✅" : "⚠️"}</div>
              <p style={{ fontWeight: 700, fontSize: "var(--text-lg)", marginBottom: 8 }}>
                {result.successCount} varlik basariyla eklendi
              </p>
              {result.errorCount > 0 && (
                <div style={{ marginTop: 16, textAlign: "left" }}>
                  <p style={{ color: "var(--danger-500)", fontWeight: 600, fontSize: 13 }}>{result.errorCount} satir hatali:</p>
                  <div style={{ maxHeight: 150, overflowY: "auto", fontSize: 12, background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: 12, marginTop: 8 }}>
                    {result.errors.slice(0, 10).map((err, i) => (
                      <div key={i} style={{ marginBottom: 4 }}>Satir {err.row}: {err.message}</div>
                    ))}
                    {result.errors.length > 10 && <div>...ve {result.errors.length - 10} hata daha</div>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            {phase === "result" ? "Kapat" : "Iptal"}
          </button>
          {phase === "mapping" && (
            <button
              onClick={handleImport}
              disabled={!hasRequiredMappings || loading}
              style={{ padding: "10px 20px", background: hasRequiredMappings ? "var(--primary-500)" : "var(--neutral-300)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: hasRequiredMappings ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 13 }}
            >
              {totalRows} Varligi Import Et
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
