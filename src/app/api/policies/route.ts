import { NextRequest, NextResponse } from "next/server";
import { savePolicyToFirestore } from "@/lib/firebase/firestore";
import { Policy, PolicyStatus } from "@/types/policy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const tenantId = body.tenantId;

    if (!tenantId) {
       return NextResponse.json({ error: "Oturum bilgisi bulunamadı." }, { status: 401 });
    }

    // Validate request strictly
    if (!body || !body.policeTipi || !body.sigortaSirketi) {
      return NextResponse.json({ error: "Eksik poliçe bilgileri" }, { status: 400 });
    }

    // Determine status from dates
    let status: PolicyStatus = "active";
    if (body.bitisTarihi) {
      const isExpired = new Date(body.bitisTarihi).getTime() < Date.now();
      if (isExpired) status = "expired";
    }

    const mappedPolicy: Partial<Policy> = {
      tenantId,
      policyType: body.policeTipi,
      policyNumber: body.policeNumarasi || "Bilinmiyor",
      insuranceCompany: body.sigortaSirketi || "Bilinmiyor",
      agencyName: body.acenteAdi || "Bilinmiyor",
      agencyCode: body.acenteNo || "",
      startDate: body.baslangicTarihi || new Date().toISOString(),
      endDate: body.bitisTarihi || new Date(Date.now() + 31536000000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      policyHolder: {
        name: body.sigortaEttiren?.unvan || "Bilinmiyor",
        taxId: body.sigortaEttiren?.vergiNo || "",
        address: body.sigortaEttiren?.adres || "",
      },
      insured: {
        name: body.sigortali?.unvan || "Bilinmiyor",
        taxId: body.sigortali?.vergiNo || "",
        address: body.sigortali?.adres || "",
      },
      coverages: (body.teminatlar || []).map((t: any) => ({
        name: t.teminatAdi || "Bilinmiyor",
        amount: t.teminatTutari ?? 0,
        currency: t.paraBirimi || "TRY",
        deductible: t.muafiyet ?? null,
        deductibleType: t.muafiyetTipi ?? null,
      })),
      premium: {
        netPremium: body.primBilgileri?.netPrim ?? 0,
        bsmv: body.primBilgileri?.bsmv ?? 0,
        thgf: body.primBilgileri?.thgf ?? 0,
        totalPremium: body.primBilgileri?.toplamPrim ?? 0,
        currency: body.primBilgileri?.paraBirimi || "TRY",
        paymentType: body.primBilgileri?.odemeSekli === "taksitli" ? "installment" : "cash",
        installmentCount: body.primBilgileri?.taksitSayisi ?? null,
      },
      aiExtraction: {
        confidenceScore: body.guvenScore || 0,
        extractedAt: new Date().toISOString(),
        model: body.modelUsed || "us.anthropic.claude-haiku-4-5-20251001-v1:0",
        manuallyReviewed: true, // They clicked 'Onayla & Kaydet'
      },
      documents: {
        originalPdf: body.originalPdfUrl || "", 
        storagePath: body.originalPdfPath || "",
        pageCount: 1,
        fileName: body.fileName || "police.pdf",
        fileSize: body.fileSize || 0,
      },
      status,
      tags: [],
      notes: (body.ozelSartlar || []).join("\n"),
    };

    console.log(`[POST /api/policies] Saving policy for tenant ${tenantId}`);
    
    // Save to Firestore
    const documentId = await savePolicyToFirestore(mappedPolicy, tenantId);

    return NextResponse.json({
      success: true,
      message: "Poliçe başarıyla kaydedildi.",
      documentId,
    });
  } catch (error: any) {
    console.error(`[POST /api/policies] Error:`, error);
    return NextResponse.json(
      { error: "Poliçe kaydedilirken bir hata oluştu.", details: error.message },
      { status: 500 }
    );
  }
}
