import { NextRequest, NextResponse } from "next/server";
import { extractPolicyFromPDF } from "@/lib/ai/bedrock";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

// PDF magic bytes: "%PDF-"
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);

// İzin verilen MIME types
const ALLOWED_MIME = new Set(["application/pdf"]);

// Dosya adı güvenlik kontrolü (path traversal)
function isSafeFilename(name: string): boolean {
  return !/[/\\:*?"<>|]/.test(name) && !name.includes("..");
}

export async function POST(req: NextRequest) {
  try {
    logger.info("PDF upload started", "upload");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    // 1. MIME type kontrolü
    if (!ALLOWED_MIME.has(file.type)) {
      logger.warn("Invalid file type rejected", "upload", { type: file.type });
      return NextResponse.json(
        { error: "Sadece PDF dosyaları kabul edilmektedir." },
        { status: 400 }
      );
    }

    // 2. Boyut kontrolü (20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 20MB sınırını aşıyor." },
        { status: 400 }
      );
    }

    // 3. Dosya adı güvenlik kontrolü
    if (!isSafeFilename(file.name)) {
      logger.warn("Unsafe filename rejected", "upload", { name: file.name });
      return NextResponse.json(
        { error: "Geçersiz dosya adı." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Magic bytes doğrulaması — MIME type'ı spoof edilemez
    if (buffer.length < 5 || !buffer.slice(0, 5).equals(PDF_MAGIC)) {
      logger.warn("Invalid PDF magic bytes", "upload", { filename: file.name });
      return NextResponse.json(
        { error: "Dosya geçerli bir PDF değil." },
        { status: 400 }
      );
    }

    logger.info("PDF validation passed, sending to AI", "upload", {
      size: file.size,
      name: file.name,
    });

    const result = await extractPolicyFromPDF(buffer);

    return NextResponse.json({
      success: true,
      data: result,
      fileName: file.name,
      fileSize: file.size,
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    logger.error("PDF upload failed", "upload", {
      error: (error as Error).message,
    });
    // Kullanıcıya detayları gösterme — sadece generic mesaj
    return NextResponse.json(
      { error: "PDF işlenirken bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
