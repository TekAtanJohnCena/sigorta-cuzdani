"use client";

import { useState, useCallback } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateShort } from "@/lib/utils/date";
import { useAuth } from "@/lib/firebase/AuthContext";
import { uploadPolicyPDF } from "@/lib/firebase/storage";

type UploadStage = "upload" | "processing" | "review" | "complete";

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

  const { appUser } = useAuth();
  
  const handleSavePolicy = async () => {
    if (!extracted || !appUser) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...extracted, tenantId: appUser.tenantId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Kaydedilirken bir hata oluştu");
      }

      setStage("complete");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const processFile = useCallback(async (file: File) => {
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Lütfen sadece PDF dosyası yükleyin.");
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

      setExtracted({
        ...json.data,
        originalPdfUrl: uploadResult.downloadUrl,
        originalPdfPath: uploadResult.storagePath,
        fileName: file.name,
        fileSize: file.size
      });
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
            <div className="dropzone-subtitle">Sigorta şirketinden gelen dijital veya taranmış poliçe PDF'leri</div>
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
                    {uploadedFile?.name}  Sonuçları inceleyin ve onaylayın
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
                    <div className="review-field-label">Poliçe Tipi</div>
                    <div className="review-field-value">{POLICY_TYPE_LABELS[extracted.policeTipi] ?? extracted.policeTipi}</div>
                  </div>
                  <div className="review-field">
                    <div className="review-field-label">Poliçe Numarası</div>
                    <div className="review-field-value" style={{ fontFamily: "var(--font-mono)" }}>
                      {extracted.policeNumarasi ?? ""}
                    </div>
                  </div>
                  <div className="review-field">
                    <div className="review-field-label">Sigorta Şirketi</div>
                    <div className="review-field-value">{extracted.sigortaSirketi ?? ""}</div>
                  </div>
                  <div className="review-field">
                    <div className="review-field-label">Acente</div>
                    <div className="review-field-value">{extracted.acenteAdi ?? ""}</div>
                  </div>
                  <div className="review-field">
                    <div className="review-field-label">Başlangıç</div>
                    <div className="review-field-value">{extracted.baslangicTarihi ? formatDateShort(extracted.baslangicTarihi) : ""}</div>
                  </div>
                  <div className="review-field">
                    <div className="review-field-label">Bitiş</div>
                    <div className="review-field-value">{extracted.bitisTarihi ? formatDateShort(extracted.bitisTarihi) : ""}</div>
                  </div>
                  <div className="review-field">
                    <div className="review-field-label">Sigorta Ettiren</div>
                    <div className="review-field-value">{extracted.sigortaEttiren?.unvan ?? ""}</div>
                  </div>
                  <div className="review-field">
                    <div className="review-field-label">Vergi No</div>
                    <div className="review-field-value" style={{ fontFamily: "var(--font-mono)" }}>
                      {extracted.sigortaEttiren?.vergiNo ?? ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Teminatlar */}
              {extracted.teminatlar?.length > 0 && (
                <div className="review-section">
                  <div className="review-section-title"> Teminatlar</div>
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Teminat Adı</th>
                          <th>Tutar</th>
                          <th>Para Birimi</th>
                          <th>Muafiyet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extracted.teminatlar.map((t, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{t.teminatAdi}</td>
                            <td style={{ fontWeight: 700 }}>{formatCurrency(t.teminatTutari, (t.paraBirimi as "TRY" | "USD" | "EUR") ?? "TRY")}</td>
                            <td><span className="badge badge-gray">{t.paraBirimi}</span></td>
                            <td style={{ color: "var(--text-secondary)" }}>
                              {t.muafiyet ? `${t.muafiyet}${t.muafiyetTipi === "yuzde" ? "%" : " ₺"}` : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Prim Bilgileri */}
              {extracted.primBilgileri && (
                <div className="review-section">
                  <div className="review-section-title"> Prim Bilgileri</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--space-3)" }}>
                    {[
                      { label: "Net Prim", value: extracted.primBilgileri.netPrim, highlight: false },
                      { label: "BSMV (%5)", value: extracted.primBilgileri.bsmv, highlight: false },
                      { label: "THGF", value: extracted.primBilgileri.thgf, highlight: false },
                      { label: "Toplam Prim", value: extracted.primBilgileri.toplamPrim, highlight: true },
                    ].map((item) => (
                      <div key={item.label} style={{
                        padding: "var(--space-3) var(--space-4)",
                        background: item.highlight ? "var(--primary-50)" : "var(--neutral-50)",
                        borderRadius: "var(--radius-md)",
                        border: item.highlight ? "2px solid var(--primary-200)" : "1px solid var(--border-light)",
                        textAlign: "center",
                      }}>
                        <div style={{ fontSize: "var(--text-xs)", color: item.highlight ? "var(--primary-600)" : "var(--text-tertiary)", fontWeight: 600 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: item.highlight ? "var(--text-xl)" : "var(--text-base)", fontWeight: 800, color: item.highlight ? "var(--primary-700)" : "var(--text-primary)", marginTop: 4 }}>
                          {item.value != null ? formatCurrency(item.value) : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "var(--space-3)", display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
                    {extracted.primBilgileri.odemeSekli && (
                      <span className="badge badge-blue">
                        {extracted.primBilgileri.odemeSekli === "taksitli" ? " Taksitli" : " Peşin"}
                        {extracted.primBilgileri.taksitSayisi ? ` (${extracted.primBilgileri.taksitSayisi} taksit)` : ""}
                      </span>
                    )}
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
              * Yapay zeka poliçe analizi sırasında bazı verileri eksik veya hatalı okumuş olabilir. Lütfen onaylamadan önce verileri hızlıca kontrol ediniz.
            </div>

            <div className="review-actions">
              <button className="btn btn-ghost" onClick={reset} disabled={isSaving}> İptal</button>
              <button className="btn btn-secondary" onClick={reset} disabled={isSaving}> Yeni PDF Yükle</button>
              <button 
                className="btn btn-success btn-lg" 
                onClick={handleSavePolicy} 
                id="confirm-policy-btn"
                disabled={isSaving}
              >
                 {isSaving ? "Kaydediliyor..." : "Onayla & Kaydet"}
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
            <a href="/dashboard/policies" className="btn btn-primary"> Poliçeleri Görüntüle</a>
          </div>
        </div>
      )}
    </div>
  );
}
