import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/aiService";
import { logger } from "@/lib/logger";
import type { ExtractionResult } from "@/lib/ai/types";

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
      logger.warn("No file in request", "upload");
      return NextResponse.json(
        {
          success: false,
          error: "Dosya bulunamadı.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 1. MIME type kontrolü
    if (!ALLOWED_MIME.has(file.type)) {
      logger.warn("Invalid file type rejected", "upload", { type: file.type });
      return NextResponse.json(
        {
          success: false,
          error: "Sadece PDF dosyaları kabul edilmektedir.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 2. Boyut kontrolü (20MB)
    if (file.size > 20 * 1024 * 1024) {
      logger.warn("File size exceeded", "upload", { size: file.size });
      return NextResponse.json(
        {
          success: false,
          error: "Dosya boyutu 20MB sınırını aşıyor.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. Dosya adı güvenlik kontrolü
    if (!isSafeFilename(file.name)) {
      logger.warn("Unsafe filename rejected", "upload", { name: file.name });
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz dosya adı.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 4. Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Magic bytes doğrulaması — MIME type'ı spoof edilemez
    if (buffer.length < 5 || !buffer.slice(0, 5).equals(PDF_MAGIC)) {
      logger.warn("Invalid PDF magic bytes", "upload", { filename: file.name });
      return NextResponse.json(
        {
          success: false,
          error: "Dosya geçerli bir PDF değil. Lütfen sigorta şirketinden gelen orijinal PDF'i yükleyin.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    logger.info("PDF validation passed, sending to AI", "upload", {
      size: file.size,
      name: file.name,
    });

    // ========================================
    // AI EXTRACTION with Unified aiService
    // Automatic Gemini fallback enabled
    // ========================================
    const response = await aiService.callAI<Buffer, ExtractionResult>({
      operation: "extractPolicy",
      input: buffer,
      options: {
        enableFallback: true,
        timeout: 55000,
        preferredProvider: "bedrock",
      },
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "AI extraction failed");
    }

    const result = response.data;

    logger.info("AI extraction completed", "upload", {
      confidenceScore: result.guvenScore,
      model: result.modelUsed,
      provider: response.metadata.provider,
      latencyMs: response.metadata.latencyMs,
      fallbackUsed: response.metadata.fallbackUsed,
      estimatedCostUSD: response.metadata.estimatedCostUSD,
    });

    return NextResponse.json({
      success: true,
      data: result,
      fileName: file.name,
      fileSize: file.size,
      modelUsed: result.modelUsed,
      aiMetadata: {
        provider: response.metadata.provider,
        latencyMs: response.metadata.latencyMs,
        fallbackUsed: response.metadata.fallbackUsed,
        confidenceScore: response.metadata.confidenceScore,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error("PDF upload failed", "upload", {
      error: errorMessage,
      stack: (error as Error).stack,
    });

    // ========================================
    // EDGE CASE HANDLING
    // ========================================
    let userMessage = "PDF işlenirken bir hata oluştu. Lütfen tekrar deneyin.";

    if (errorMessage.includes("timeout")) {
      userMessage = "AI analizi çok uzun sürdü. Lütfen daha küçük bir PDF deneyin veya manuel giriş yapın.";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("ThrottlingException")) {
      userMessage = "Sistem yoğun. Lütfen birkaç saniye sonra tekrar deneyin.";
    } else if (errorMessage.includes("taranmış görüntü") || errorMessage.includes("şifreli")) {
      userMessage = "PDF metin içermiyor (taranmış görüntü veya şifreli olabilir). Manuel giriş yapabilirsiniz.";
    }

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
