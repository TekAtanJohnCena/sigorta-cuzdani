import { NextRequest, NextResponse } from "next/server";
import { savePolicyToFirestore } from "@/lib/firebase/firestore";
import { Policy, PolicyStatus } from "@/types/policy";
import { logger } from "@/lib/logger";
import { withAuth } from "@/lib/api/withAuth";

// ============================================
// Policies API — G-01, G-04, G-11 güvenlik düzeltmeleri
// tenantId artık Firebase ID Token'dan alınıyor (withAuth)
// ============================================

// Basit string sanitizasyonu (XSS koruması)
function sanitize(value: unknown, maxLen = 200): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[<>]/g, "") // HTML tag'ları engelle
    .slice(0, maxLen)
    .trim();
}

function sanitizeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return isFinite(n) && n >= 0 ? n : fallback;
}

// ISO tarih formatı doğrulama (G-11)
function isValidISODate(value: unknown): boolean {
  if (typeof value !== "string" || !value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

// Zorunlu alan doğrulama
function validatePolicyBody(body: Record<string, unknown>): string | null {
  if (!body.policeTipi || typeof body.policeTipi !== "string") {
    return "Poliçe tipi zorunludur.";
  }
  if (!body.sigortaSirketi || typeof body.sigortaSirketi !== "string") {
    return "Sigorta şirketi zorunludur.";
  }
  // G-04: "isyeri" eklendi
  const ALLOWED_TYPES = [
    "kasko", "trafik", "yangin", "saglik", "nakliyat", "isyeri",
    "dask", "ferdi_kaza", "sorumluluk", "muhendislik", "tarim", "diger"
  ];
  if (!ALLOWED_TYPES.includes(body.policeTipi as string)) {
    return "Geçersiz poliçe tipi.";
  }
  return null;
}

// G-01: withAuth wrapper — tenantId artık token'dan geliyor
export const POST = withAuth(async (req, { tenantId, uid }) => {
  try {
    const body = await req.json();

    // Input doğrulama
    const validationError = validatePolicyBody(body);
    if (validationError) {
      logger.warn("Policy validation failed", "api/policies", { error: validationError, uid });
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // G-11: Başlangıç tarihi doğrulama
    if (body.baslangicTarihi && !isValidISODate(body.baslangicTarihi)) {
      return NextResponse.json({ error: "Geçersiz başlangıç tarihi." }, { status: 400 });
    }

    // Bitiş tarihi doğrulama (mevcut)
    let status: PolicyStatus = "active";
    if (body.bitisTarihi) {
      if (!isValidISODate(body.bitisTarihi)) {
        return NextResponse.json({ error: "Geçersiz bitiş tarihi." }, { status: 400 });
      }
      const endDate = new Date(body.bitisTarihi as string);
      if (endDate.getTime() < Date.now()) status = "expired";
    }

    const mappedPolicy: Partial<Policy> = {
      tenantId, // G-01: Token'dan geliyor, client body'den DEĞİL
      policyType: sanitize(body.policeTipi, 50) as Policy["policyType"],
      policyNumber: sanitize(body.policeNumarasi, 50) || "Bilinmiyor",
      insuranceCompany: sanitize(body.sigortaSirketi, 100) || "Bilinmiyor",
      agencyName: sanitize(body.acenteAdi, 100) || "Bilinmiyor",
      agencyCode: sanitize(body.acenteNo, 50),
      startDate: body.baslangicTarihi as string || new Date().toISOString(),
      endDate: body.bitisTarihi as string || new Date(Date.now() + 31536000000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      policyHolder: {
        name: sanitize(body.sigortaEttiren?.unvan, 150) || "Bilinmiyor",
        taxId: sanitize(body.sigortaEttiren?.vergiNo, 20),
        address: sanitize(body.sigortaEttiren?.adres, 300),
      },
      insured: {
        name: sanitize(body.sigortali?.unvan, 150) || "Bilinmiyor",
        taxId: sanitize(body.sigortali?.vergiNo, 20),
        address: sanitize(body.sigortali?.adres, 300),
      },
      coverages: (Array.isArray(body.teminatlar) ? body.teminatlar : []).map((t: Record<string, unknown>) => ({
        name: sanitize(t.teminatAdi, 100) || "Bilinmiyor",
        amount: sanitizeNumber(t.teminatTutari),
        currency: sanitize(t.paraBirimi, 5) || "TRY",
        deductible: t.muafiyet != null ? sanitizeNumber(t.muafiyet) : null,
        deductibleType: t.muafiyetTipi ? sanitize(t.muafiyetTipi as string, 50) : null,
      })),
      premium: {
        netPremium: sanitizeNumber(body.primBilgileri?.netPrim),
        bsmv: sanitizeNumber(body.primBilgileri?.bsmv),
        thgf: sanitizeNumber(body.primBilgileri?.thgf),
        totalPremium: sanitizeNumber(body.primBilgileri?.toplamPrim),
        currency: (sanitize(body.primBilgileri?.paraBirimi as string, 5) || "TRY") as import("@/types/policy").Currency,
        paymentType: body.primBilgileri?.odemeSekli === "taksitli" ? "installment" : "cash",
        installmentCount: body.primBilgileri?.taksitSayisi != null
          ? sanitizeNumber(body.primBilgileri.taksitSayisi)
          : undefined,
      },
      aiExtraction: {
        confidenceScore: Math.min(100, Math.max(0, sanitizeNumber(body.guvenScore))),
        extractedAt: new Date().toISOString(),
        model: sanitize(body.modelUsed, 100) || "unknown",
        manuallyReviewed: true,
      },
      documents: {
        originalPdf: sanitize(body.originalPdfUrl as string, 500),
        storagePath: sanitize(body.originalPdfPath as string, 500),
        pageCount: 1,
        fileName: sanitize(body.fileName as string, 255) || "police.pdf",
        fileSize: sanitizeNumber(body.fileSize),
      },
      status,
      tags: [],
      notes: Array.isArray(body.ozelSartlar)
        ? (body.ozelSartlar as string[]).map((s) => sanitize(s, 200)).join("\n")
        : "",
    };

    logger.info("Saving policy", "api/policies", { tenantId, uid, type: mappedPolicy.policyType });

    const documentId = await savePolicyToFirestore(mappedPolicy, tenantId);

    return NextResponse.json({
      success: true,
      message: "Poliçe başarıyla kaydedildi.",
      documentId,
    });
  } catch (error) {
    logger.error("Policy save failed", "api/policies", {
      error: (error as Error).message,
    });
    // İç hata detaylarını client'a gösterme
    return NextResponse.json(
      { error: "Poliçe kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
});

