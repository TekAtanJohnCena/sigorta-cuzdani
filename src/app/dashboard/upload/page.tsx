"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { uploadPolicyPDF } from "@/lib/firebase/storage";
import { auth } from "@/lib/firebase/config";
// import { FileUploadSchema } from "@/lib/validation/policySchemas"; // Temp disabled
import { Toast, ToastContainer } from "@/components/Toast";

type UploadStage = "upload" | "processing" | "review" | "complete";
type ToastType = "success" | "error" | "warning" | "info";

interface ExtractedData {
  policeTipi: string;
  policeNumarasi: string | null;
  sigortaSirketi: string | null;
  acenteAdi: string | null;
  baslangicTarihi: string | null;
  bitisTarihi: string | null;
  sigortaEttiren: { unvan: string | null; vergiNo: string | null; adres: string | null };
  teminatlar: Array<{ teminatAdi: string; teminatTutari: number; paraBirimi: string; muafiyet: number | null; muafiyetTipi: string | null }>;
  primBilgileri: { netPrim: number | null; bsmv: number | null; thgf: number | null; toplamPrim: number | null; paraBirimi: string; odemeSekli: string | null; taksitSayisi: number | null };
  ozelSartlar: string[];
  guvenScore: number;
  originalPdfUrl?: string;
  originalPdfPath?: string;
  fileName?: string;
  fileSize?: number;
}

const POLICY_TYPE_LABELS: Record<string, string> = {
  kasko: " Kasko", trafik: " Trafik", yangin: " Yangın",
  saglik: " Sağlık", isyeri: " İşyeri", nakliyat: " Nakliyat",
  muhendislik: " Mühendislik", sorumluluk: " Sorumluluk",
  ferdi_kaza: " Ferdi Kaza", dask: " DASK", diger: " Diğer",
};

const PROCESSING_STEPS = [
  "PDF okunuyor...", "Sayfa analizi yapılıyor...",
  "AI motoru başlatılıyor...", "Poliçe verileri çıkarılıyor...",
  "Teminat tablosu ayrıştırılıyor...", "Prim bilgileri doğrulanıyor...",
  "Sonuçlar hazırlanıyor...",
];

export default function UploadPage() {
  const [stage, setStage] = useState<UploadStage>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType }>>([]);
  const addToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const { appUser } = useAuth();
  
  const validateExtractedData = (): boolean => {
    const errors: Record<string, string> = {};

    if (!extracted) return false;

    // Date validation
    if (extracted.baslangicTarihi && extracted.bitisTarihi) {
      const startDate = new Date(extracted.baslangicTarihi);
      const endDate = new Date(extracted.bitisTarihi);

      if (isNaN(startDate.getTime())) {
        errors.baslangicTarihi = "Geçersiz başlangıç tarihi formatı";
      }

      if (isNaN(endDate.getTime())) {
        errors.bitisTarihi = "Geçersiz bitiş tarihi formatı";
      }

      if (startDate > endDate) {
        errors.dateRange = "Başlangıç tarihi bitiş tarihinden sonra olamaz";
      }
    }

    // Policy number validation
    if (!extracted.policeNumarasi || extracted.policeNumarasi.trim().length === 0) {
      errors.policeNumarasi = "Poliçe numarası zorunludur";
    }

    // Insurance company validation
    if (!extracted.sigortaSirketi || extracted.sigortaSirketi.trim().length === 0) {
      errors.sigortaSirketi = "Sigorta şirketi zorunludur";
    }

    // Premium validation
    if (extracted.primBilgileri?.toplamPrim && extracted.primBilgileri.toplamPrim <= 0) {
      errors.toplamPrim = "Toplam prim sıfırdan büyük olmalıdır";
    }

    // TODO: Display validation errors in UI
    if (Object.keys(errors).length > 0) {
      console.warn("Validation errors:", errors);
    }
    return Object.keys(errors).length === 0;
  };

  const handleSavePolicy = async () => {
    if (!extracted || !appUser) return;

    // Client-side validation
    if (!validateExtractedData()) {
      addToast("Lütfen formdaki hataları düzeltin", "error");
      return;
    }

    setIsSaving(true);
    setError(null);
    addToast("Poliçe kaydediliyor...", "info");

    try {
      // Firebase ID Token al — server-side auth için zorunlu
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ ...extracted, tenantId: appUser.tenantId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        // Show field-level errors if available
        if (json.fieldErrors && Array.isArray(json.fieldErrors)) {
          json.fieldErrors.forEach((err: { field: string; message: string }) => {
            addToast(`${err.field}: ${err.message}`, "error");
          });
        }
        throw new Error(json.error || "Kaydedilirken bir hata oluştu");
      }

      addToast("✅ Poliçe başarıyla kaydedildi!", "success");
      setTimeout(() => setStage("complete"), 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      addToast(`Hata: ${msg}`, "error");
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const processFile = useCallback(async (file: File) => {
    // ========================================
    // BASIC FILE VALIDATION (Client-side)
    // ========================================
    if (file.type !== "application/pdf") {
      setError("Sadece PDF dosyaları kabul edilmektedir");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Dosya boyutu 20MB'dan küçük olmalıdır");
      return;
    }

    // Additional magic bytes check (first 5 bytes must be %PDF-)
    try {
      const firstBytes = await file.slice(0, 5).arrayBuffer();
      const header = new TextDecoder("utf-8").decode(firstBytes);
      if (!header.startsWith("%PDF-")) {
        setError("Dosya geçerli bir PDF değil. Lütfen sigorta şirketinden gelen orijinal PDF'i yükleyin.");
        return;
      }
    } catch {
      setError("Dosya okunamadı. Lütfen tekrar deneyin.");
      return;
    }

    setUploadedFile(file);
    setError(null);
    setStage("processing");
    setProcessingStep(0);

    // Animate steps while waiting for API
    let step = 0;
    const stepInterval = setInterval(() => {
      step = Math.min(step + 1, PROCESSING_STEPS.length - 2);
      setProcessingStep(step);
    }, 700);

    try {
      // Parallel Process: Upload to Storage & Extract via Bedrock API
      const formData = new FormData();
      formData.append("file", file);

      // We wait for both network calls. If Storage upload fails (due to rules/CORS), gracefully handle it.
      const isDemoUser = appUser?.email?.startsWith("demo@");
      const uploadPromise = (appUser && !isDemoUser) 
        ? uploadPolicyPDF(file, appUser.tenantId).catch(err => {
            console.warn("Storage upload failed (CORS or Rules issue). Skipping PDF storage:", err);
            return { downloadUrl: "", storagePath: "" };
          })
        : Promise.resolve({ downloadUrl: "", storagePath: "" });


      const [uploadResult, bedrockRes] = await Promise.all([
         uploadPromise,
         fetch("/api/policies/upload", { method: "POST", body: formData })
      ]);

      clearInterval(stepInterval);
      setProcessingStep(PROCESSING_STEPS.length - 1);

      const json = await bedrockRes.json();
      if (!bedrockRes.ok || !json.success) {
        throw new Error(json.error || "API hatası");
      }

      const extractedData = {
        ...json.data,
        originalPdfUrl: uploadResult.downloadUrl,
        originalPdfPath: uploadResult.storagePath,
        fileName: file.name,
        fileSize: file.size
      };

      // ========================================
      // GRACEFUL FALLBACK: Check if AI extraction was successful
      // If confidence is too low or critical fields are missing, warn user
      // ========================================
      const confidenceScore = extractedData.guvenScore || 0;
      const criticalFieldsMissing =
        !extractedData.policeNumarasi ||
        !extractedData.sigortaSirketi ||
        !extractedData.baslangicTarihi ||
        !extractedData.bitisTarihi;

      if (confidenceScore < 30 || criticalFieldsMissing) {
        // AI failed to extract critical data — show warning but allow manual entry
        setError(
          "⚠️ AI bazı verileri okuyamadı. Lütfen eksik alanları manuel olarak doldurun."
        );
      }

      setExtracted(extractedData);
      setTimeout(() => setStage("review"), 400);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError("Hata: " + msg);
      setStage("upload");
    }
  }, [appUser]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const reset = () => {
    setStage("upload");
    setUploadedFile(null);
    setExtracted(null);
    setError(null);
    setProcessingStep(0);
  };

  const getConfidenceClass = (score: number) =>
    score >= 80 ? "high" : score >= 55 ? "medium" : "low";

  return (
    <>
      {/* Toast Container */}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>

      <div>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h1 className="page-title">Belge Yükle & Analiz</h1>
          <p className="page-subtitle">
            Sigorta poliçenizi (PDF) yükleyin — Sistem otomatik analiz eder.
          </p>
        </div>

      {/* Error Banner */}
      {error && (
        <div className="toast toast-error animate-fade-in" style={{ marginBottom: "var(--space-4)", maxWidth: "100%" }}>
          <span style={{ fontSize: 20 }}></span>
          <div className="toast-message">
            <div className="toast-title">İşlem Hatası</div>
            <div className="toast-description">{error}</div>
          </div>
          <button className="toast-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* STAGE: UPLOAD */}
      {stage === "upload" && (
        <div className="animate-fade-in-up">
          <div
            className={`dropzone ${isDragging ? "active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            id="pdf-dropzone"
          >
            <div className="dropzone-icon">📄</div>
            <div className="dropzone-title">PDF dosyanızı sürükleyin veya tıklayın</div>
            <div className="dropzone-subtitle">Sigorta şirketinden gelen dijital veya taranmış poliçe PDF&apos;leri</div>
            <div className="dropzone-hint">Maks. 20MB · Sadece PDF formatı</div>
            <input type="file" id="file-input" accept="application/pdf" style={{ display: "none" }} onChange={handleFileSelect} />
          </div>

          <div className="card" style={{ marginTop: "var(--space-6)", padding: "var(--space-5)" }}>
            <div className="card-title" style={{ marginBottom: "var(--space-3)" }}> İpuçları</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
              {[
                { icon: "📄", title: "Dijital PDF tercih edin", desc: "Sigorta şirketinden gelen orijinal dijital PDF en iyi sonucu verir." },
                { icon: "📸", title: "Taranmış belgeler de olur", desc: "Fotoğraf/tarama PDF'lerini de AI ile okuyabiliyoruz." },
                { icon: "🔒", title: "Verileriniz güvende", desc: "256-bit şifreleme ile Firebase EU sunucularında saklanır (KVKK uyumlu)." },
              ].map((tip) => (
                <div key={tip.title} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24 }}>{tip.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{tip.title}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE: PROCESSING */}
      {stage === "processing" && (
        <div className="card animate-fade-in">
          <div className="ai-processing">
            <div className="ai-brain"></div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
                AI Analiz Ediyor
              </div>
              <div className="ai-status-text">{PROCESSING_STEPS[processingStep]}</div>
              {uploadedFile && (
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-2)" }}>
                   {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                </div>
              )}
            </div>
            <div className="ai-dots"><span /><span /><span /></div>
            <div style={{ width: "100%", maxWidth: 400 }}>
              <div className="progress-bar" style={{ height: 8 }}>
                <div
                  className="progress-bar-fill animated"
                  style={{ width: `${Math.round(((processingStep + 1) / PROCESSING_STEPS.length) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: REVIEW */}
      {stage === "review" && extracted && (
        <div className="animate-fade-in-up">
          <div className="review-panel">
            {/* Header */}
            <div className="review-header">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <span style={{ fontSize: 28 }}></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>AI Analizi Tamamlandı</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    {uploadedFile?.name}  Verileri kontrol edin ve düzenleyin
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontWeight: 500 }}>AI Güveni:</span>
                <div className="confidence-bar" style={{ minWidth: 160 }}>
                  <div className="confidence-bar-track">
                    <div className={`confidence-bar-fill ${getConfidenceClass(extracted.guvenScore)}`}
                      style={{ width: `${extracted.guvenScore}%` }} />
                  </div>
                  <span className="confidence-label"
                    style={{ color: extracted.guvenScore >= 80 ? "var(--success-600)" : extracted.guvenScore >= 55 ? "var(--warning-600)" : "var(--danger-500)" }}>
                    {extracted.guvenScore}
                  </span>
                </div>
              </div>
            </div>

            <div className="review-body">
              {/* Temel Bilgiler */}
              <div className="review-section">
                <div className="review-section-title"> Temel Bilgiler</div>
                <div className="review-grid">
                  <div className="review-field">
                    <label className="review-field-label" htmlFor="policeTipi">Poliçe Tipi</label>
                    <select
                      id="policeTipi"
                      className="input"
                      value={extracted.policeTipi}
                      onChange={(e) => setExtracted({ ...extracted, policeTipi: e.target.value })}
                      style={{ width: "100%", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)" }}
                    >
                      {Object.entries(POLICY_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="review-field">
                    <label className="review-field-label" htmlFor="policeNumarasi">
                      Poliçe Numarası
                      <span style={{ color: "var(--danger-500)", marginLeft: 4 }}>*</span>
                    </label>
                    <input
                      id="policeNumarasi"
                      type="text"
                      className="input"
                      value={extracted.policeNumarasi ?? ""}
                      onChange={(e) => setExtracted({ ...extracted, policeNumarasi: e.target.value })}
                      placeholder="Poliçe numarasını giriniz"
                      style={{
                        width: "100%",
                        padding: "var(--space-2) var(--space-3)",
                        fontSize: "var(--text-sm)",
                        fontFamily: "var(--font-mono)",
                        borderColor: !extracted.policeNumarasi ? "var(--danger-500)" : undefined
                      }}
                    />
                  </div>
                  <div className="review-field">
                    <label className="review-field-label" htmlFor="sigortaSirketi">
                      Sigorta Şirketi
                      <span style={{ color: "var(--danger-500)", marginLeft: 4 }}>*</span>
                    </label>
                    <input
                      id="sigortaSirketi"
                      type="text"
                      className="input"
                      value={extracted.sigortaSirketi ?? ""}
                      onChange={(e) => setExtracted({ ...extracted, sigortaSirketi: e.target.value })}
                      placeholder="Sigorta şirketini giriniz"
                      style={{
                        width: "100%",
                        padding: "var(--space-2) var(--space-3)",
                        fontSize: "var(--text-sm)",
                        borderColor: !extracted.sigortaSirketi ? "var(--danger-500)" : undefined
                      }}
                    />
                  </div>
                  <div className="review-field">
                    <label className="review-field-label" htmlFor="acenteAdi">Acente</label>
                    <input
                      id="acenteAdi"
                      type="text"
                      className="input"
                      value={extracted.acenteAdi ?? ""}
                      onChange={(e) => setExtracted({ ...extracted, acenteAdi: e.target.value })}
                      placeholder="Acente adı (opsiyonel)"
                      style={{ width: "100%", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)" }}
                    />
                  </div>
                  <div className="review-field">
                    <label className="review-field-label" htmlFor="baslangicTarihi">Başlangıç</label>
                    <input
                      id="baslangicTarihi"
                      type="date"
                      className="input"
                      value={extracted.baslangicTarihi ?? ""}
                      onChange={(e) => setExtracted({ ...extracted, baslangicTarihi: e.target.value })}
                      style={{ width: "100%", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)" }}
                    />
                  </div>
                  <div className="review-field">
                    <label className="review-field-label" htmlFor="bitisTarihi">Bitiş</label>
                    <input
                      id="bitisTarihi"
                      type="date"
                      className="input"
                      value={extracted.bitisTarihi ?? ""}
                      onChange={(e) => setExtracted({ ...extracted, bitisTarihi: e.target.value })}
                      style={{ width: "100%", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)" }}
                    />
                  </div>
                  <div className="review-field">
                    <label className="review-field-label" htmlFor="sigortaEttirenUnvan">Sigorta Ettiren</label>
                    <input
                      id="sigortaEttirenUnvan"
                      type="text"
                      className="input"
                      value={extracted.sigortaEttiren?.unvan ?? ""}
                      onChange={(e) => setExtracted({
                        ...extracted,
                        sigortaEttiren: { ...extracted.sigortaEttiren, unvan: e.target.value }
                      })}
                      placeholder="Unvan"
                      style={{ width: "100%", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)" }}
                    />
                  </div>
                  <div className="review-field">
                    <label className="review-field-label" htmlFor="sigortaEttirenVergiNo">Vergi No</label>
                    <input
                      id="sigortaEttirenVergiNo"
                      type="text"
                      className="input"
                      value={extracted.sigortaEttiren?.vergiNo ?? ""}
                      onChange={(e) => setExtracted({
                        ...extracted,
                        sigortaEttiren: { ...extracted.sigortaEttiren, vergiNo: e.target.value }
                      })}
                      placeholder="Vergi numarası"
                      style={{
                        width: "100%",
                        padding: "var(--space-2) var(--space-3)",
                        fontSize: "var(--text-sm)",
                        fontFamily: "var(--font-mono)"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Teminatlar */}
              <div className="review-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="review-section-title"> Teminatlar</div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setExtracted({
                      ...extracted,
                      teminatlar: [...(extracted.teminatlar || []), { teminatAdi: "", teminatTutari: 0, paraBirimi: "TRY", muafiyet: null, muafiyetTipi: null }]
                    })}
                    style={{ fontSize: "var(--text-sm)", padding: "4px 12px" }}
                  >
                    + Teminat Ekle
                  </button>
                </div>
                {extracted.teminatlar?.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Teminat Adı</th>
                          <th>Tutar</th>
                          <th>Para Birimi</th>
                          <th>Muafiyet</th>
                          <th style={{ width: 40 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {extracted.teminatlar.map((t, i) => (
                          <tr key={i}>
                            <td>
                              <input
                                type="text"
                                className="input"
                                value={t.teminatAdi}
                                onChange={(e) => {
                                  const updated = [...extracted.teminatlar];
                                  updated[i] = { ...updated[i], teminatAdi: e.target.value };
                                  setExtracted({ ...extracted, teminatlar: updated });
                                }}
                                placeholder="Teminat adı"
                                style={{ width: "100%", padding: "4px 8px", fontSize: "var(--text-sm)", fontWeight: 500 }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="input"
                                value={t.teminatTutari || ""}
                                onChange={(e) => {
                                  const updated = [...extracted.teminatlar];
                                  updated[i] = { ...updated[i], teminatTutari: e.target.value ? parseFloat(e.target.value) : 0 };
                                  setExtracted({ ...extracted, teminatlar: updated });
                                }}
                                placeholder="0"
                                step="0.01"
                                style={{ width: "100%", padding: "4px 8px", fontSize: "var(--text-sm)", fontWeight: 700 }}
                              />
                            </td>
                            <td>
                              <select
                                className="input"
                                value={t.paraBirimi}
                                onChange={(e) => {
                                  const updated = [...extracted.teminatlar];
                                  updated[i] = { ...updated[i], paraBirimi: e.target.value };
                                  setExtracted({ ...extracted, teminatlar: updated });
                                }}
                                style={{ padding: "4px 8px", fontSize: "var(--text-sm)" }}
                              >
                                <option value="TRY">TRY</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="input"
                                value={t.muafiyet ?? ""}
                                onChange={(e) => {
                                  const updated = [...extracted.teminatlar];
                                  updated[i] = { ...updated[i], muafiyet: e.target.value ? parseFloat(e.target.value) : null };
                                  setExtracted({ ...extracted, teminatlar: updated });
                                }}
                                placeholder="—"
                                style={{ width: 80, padding: "4px 8px", fontSize: "var(--text-sm)" }}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = extracted.teminatlar.filter((_, idx) => idx !== i);
                                  setExtracted({ ...extracted, teminatlar: updated });
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger-500)", fontSize: 16, padding: 4 }}
                                title="Teminatı Kaldır"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                    Teminat bulunamadı. Yukarıdaki butona tıklayarak ekleyin.
                  </div>
                )}
              </div>

              {/* Prim Bilgileri */}
              {extracted.primBilgileri && (
                <div className="review-section">
                  <div className="review-section-title"> Prim Bilgileri</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
                    {[
                      { label: "Net Prim", field: "netPrim", value: extracted.primBilgileri.netPrim, highlight: false },
                      { label: "BSMV (%5)", field: "bsmv", value: extracted.primBilgileri.bsmv, highlight: false },
                      { label: "THGF", field: "thgf", value: extracted.primBilgileri.thgf, highlight: false },
                      { label: "Toplam Prim", field: "toplamPrim", value: extracted.primBilgileri.toplamPrim, highlight: true },
                    ].map((item) => (
                      <div key={item.label} style={{
                        padding: "var(--space-3) var(--space-4)",
                        background: item.highlight ? "var(--primary-50)" : "var(--neutral-50)",
                        borderRadius: "var(--radius-md)",
                        border: item.highlight ? "2px solid var(--primary-200)" : "1px solid var(--border-light)",
                      }}>
                        <label style={{ fontSize: "var(--text-xs)", color: item.highlight ? "var(--primary-600)" : "var(--text-tertiary)", fontWeight: 600, display: "block", marginBottom: 4 }}>
                          {item.label}
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={item.value ?? ""}
                          onChange={(e) => setExtracted({
                            ...extracted,
                            primBilgileri: {
                              ...extracted.primBilgileri,
                              [item.field]: e.target.value ? parseFloat(e.target.value) : null
                            }
                          })}
                          placeholder="0.00"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "var(--space-2)",
                            fontSize: item.highlight ? "var(--text-lg)" : "var(--text-base)",
                            fontWeight: item.highlight ? 700 : 600,
                            color: item.highlight ? "var(--primary-700)" : "var(--text-primary)",
                            textAlign: "center",
                            border: item.highlight ? "1px solid var(--primary-300)" : undefined
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-4)", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: "1 1 200px" }}>
                      <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                        Ödeme Şekli
                      </label>
                      <select
                        className="input"
                        value={extracted.primBilgileri.odemeSekli ?? ""}
                        onChange={(e) => setExtracted({
                          ...extracted,
                          primBilgileri: { ...extracted.primBilgileri, odemeSekli: e.target.value }
                        })}
                        style={{ width: "100%", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)" }}
                      >
                        <option value="">Seçiniz</option>
                        <option value="pesin">Peşin</option>
                        <option value="taksitli">Taksitli</option>
                      </select>
                    </div>
                    {extracted.primBilgileri.odemeSekli === "taksitli" && (
                      <div style={{ flex: "1 1 150px" }}>
                        <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                          Taksit Sayısı
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={extracted.primBilgileri.taksitSayisi ?? ""}
                          onChange={(e) => setExtracted({
                            ...extracted,
                            primBilgileri: {
                              ...extracted.primBilgileri,
                              taksitSayisi: e.target.value ? parseInt(e.target.value) : null
                            }
                          })}
                          placeholder="Taksit sayısı"
                          min="2"
                          max="12"
                          style={{ width: "100%", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)" }}
                        />
                      </div>
                    )}
                    <div style={{ flex: "1 1 150px" }}>
                      <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                        Para Birimi
                      </label>
                      <select
                        className="input"
                        value={extracted.primBilgileri.paraBirimi ?? "TRY"}
                        onChange={(e) => setExtracted({
                          ...extracted,
                          primBilgileri: { ...extracted.primBilgileri, paraBirimi: e.target.value }
                        })}
                        style={{ width: "100%", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)" }}
                      >
                        <option value="TRY">TRY</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Özel Şartlar */}
              {extracted.ozelSartlar?.length > 0 && (
                <div className="review-section">
                  <div className="review-section-title"> Özel Şartlar</div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {extracted.ozelSartlar.map((s, i) => (
                      <li key={i} style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", display: "flex", gap: "var(--space-2)" }}>
                        <span></span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textAlign: "center", marginTop: "var(--space-6)", marginBottom: "var(--space-4)" }}>
              Yapay zeka poliçe analizi sırasında bazı verileri eksik veya hatalı okumuş olabilir. Lütfen verileri kontrol edin ve gerekirse düzeltin.
            </div>

            <div className="review-actions">
              <button
                className="btn btn-ghost"
                onClick={reset}
                disabled={isSaving}
                aria-disabled={isSaving}
              >
                 İptal
              </button>
              <button
                className="btn btn-secondary"
                onClick={reset}
                disabled={isSaving}
                aria-disabled={isSaving}
              >
                 Yeni PDF Yükle
              </button>
              <button
                className="btn btn-success btn-lg"
                onClick={handleSavePolicy}
                id="confirm-policy-btn"
                disabled={isSaving}
                aria-disabled={isSaving}
                aria-busy={isSaving}
                style={{
                  cursor: isSaving ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.6 : 1,
                  pointerEvents: isSaving ? "none" : "auto",
                }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner" style={{ marginRight: 8 }} />
                    Kaydediliyor...
                  </>
                ) : (
                  <> Onayla & Kaydet</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: COMPLETE */}
      {stage === "complete" && (
        <div className="card animate-scale-in" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <div style={{ fontSize: 72, marginBottom: "var(--space-4)" }}></div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Poliçe Başarıyla Kaydedildi!
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-8)" }}>
            {extracted?.sigortaSirketi}  {extracted?.policeNumarasi ?? ""}
            <br />Dashboard otomatik güncellenmiştir.
          </p>
          <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center" }}>
            <button className="btn btn-secondary" onClick={reset}> Yeni PDF Yükle</button>
            <Link href="/dashboard/policies" className="btn btn-primary"> Poliçeleri Görüntüle</Link>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
