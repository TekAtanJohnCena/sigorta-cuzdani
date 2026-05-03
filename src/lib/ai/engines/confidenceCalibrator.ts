/**
 * Confidence Calibrator Engine
 * Post-processes AI extraction results to improve accuracy and flag low-confidence outputs
 * Implements "Zero Hallucination" strategy via self-verification
 */

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import type { ExtractionResult } from "@/lib/ai/types";
import { logger } from "@/lib/logger";

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
const MODEL_ID = "us.anthropic.claude-haiku-4-5-20251001-v1:0";

export interface ConfidenceFlag {
  field: string;
  currentValue: unknown;
  confidence: number;
  reason: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
}

export interface CalibrationResult {
  originalResult: ExtractionResult;
  verified: boolean;
  needsManualReview: boolean;
  isReliable: boolean; // TRUE if guvenScore >= 85 and no critical flags remain
  flags: ConfidenceFlag[];
  verifiedFields?: Partial<ExtractionResult>;
  guvenScore: number; // 0-100
  businessReadyForB2B: boolean; // Alias for clarity in B2B context
}

/**
 * Critical fields that must have high confidence (>= 85%) for B2B reliability
 */
const CRITICAL_FIELDS = [
  "policeNumarasi",
  "sigortaSirketi",
  "baslangicTarihi",
  "bitisTarihi",
  "primBilgileri.toplamPrim",
  "primBilgileri.netPrim",
  "policeTipi",
] as const;

/**
 * Minimum confidence threshold for critical fields (B2B standard: 85%)
 */
const CRITICAL_CONFIDENCE_THRESHOLD = 85;

/**
 * Confidence Calibrator Class
 */
export class ConfidenceCalibrator {
  /**
   * Main calibration method - analyzes extraction result and triggers verification if needed
   */
  async calibrate(
    extractionResult: ExtractionResult,
    originalPdfText: string
  ): Promise<CalibrationResult> {
    logger.info("Starting confidence calibration", "ConfidenceCalibrator", {
      modelUsed: extractionResult.modelUsed,
      initialConfidence: extractionResult.guvenScore,
    });

    const flags = this.analyzeConfidence(extractionResult);
    const criticalFlags = flags.filter((f) => f.severity === "CRITICAL");

    // If no critical flags, result is verified
    if (criticalFlags.length === 0) {
      const finalScore = extractionResult.guvenScore || 100;
      const isReliable = finalScore >= CRITICAL_CONFIDENCE_THRESHOLD;

      logger.info("Calibration passed - no critical issues", "ConfidenceCalibrator", {
        finalScore,
        isReliable,
      });

      return {
        originalResult: extractionResult,
        verified: true,
        needsManualReview: false,
        isReliable,
        businessReadyForB2B: isReliable,
        flags,
        guvenScore: finalScore,
      };
    }

    // Trigger secondary verification for critical fields
    logger.info(
      `Calibration triggered secondary verification for ${criticalFlags.length} critical fields`,
      "ConfidenceCalibrator",
      { criticalFields: criticalFlags.map((f) => f.field) }
    );

    try {
      const verifiedFields = await this.performSecondaryVerification(
        extractionResult,
        originalPdfText,
        criticalFlags
      );

      // Recalculate confidence after verification
      const newConfidenceScore = this.calculateOverallConfidence(
        extractionResult,
        verifiedFields,
        flags
      );

      const isReliable = newConfidenceScore >= CRITICAL_CONFIDENCE_THRESHOLD;
      const remainingCriticalFlags = flags.filter((f) => f.severity === "CRITICAL").length;

      logger.info("Secondary verification complete", "ConfidenceCalibrator", {
        newConfidenceScore,
        isReliable,
        remainingCriticalFlags,
      });

      return {
        originalResult: extractionResult,
        verified: newConfidenceScore >= CRITICAL_CONFIDENCE_THRESHOLD,
        needsManualReview: !isReliable || remainingCriticalFlags > 0,
        isReliable: isReliable && remainingCriticalFlags === 0,
        businessReadyForB2B: isReliable && remainingCriticalFlags === 0,
        flags,
        verifiedFields,
        guvenScore: newConfidenceScore,
      };
    } catch (error) {
      logger.error("Secondary verification failed", "ConfidenceCalibrator", error);
      return {
        originalResult: extractionResult,
        verified: false,
        needsManualReview: true,
        isReliable: false,
        businessReadyForB2B: false,
        flags,
        guvenScore: extractionResult.guvenScore || 0,
      };
    }
  }

  /**
   * Analyze confidence scores for each field and generate flags
   */
  private analyzeConfidence(result: ExtractionResult): ConfidenceFlag[] {
    const flags: ConfidenceFlag[] = [];

    // Check policy number
    if (!result.policeNumarasi || result.policeNumarasi.length < 5) {
      flags.push({
        field: "policeNumarasi",
        currentValue: result.policeNumarasi,
        confidence: 40,
        reason: "Poliçe numarası eksik veya çok kısa",
        severity: "CRITICAL",
      });
    }

    // Check insurance company
    if (!result.sigortaSirketi || result.sigortaSirketi.length < 3) {
      flags.push({
        field: "sigortaSirketi",
        currentValue: result.sigortaSirketi,
        confidence: 40,
        reason: "Sigorta şirketi adı eksik",
        severity: "CRITICAL",
      });
    }

    // Check dates
    if (!this.isValidDate(result.baslangicTarihi)) {
      flags.push({
        field: "baslangicTarihi",
        currentValue: result.baslangicTarihi,
        confidence: 30,
        reason: "Başlangıç tarihi geçersiz format",
        severity: "CRITICAL",
      });
    }

    if (!this.isValidDate(result.bitisTarihi)) {
      flags.push({
        field: "bitisTarihi",
        currentValue: result.bitisTarihi,
        confidence: 30,
        reason: "Bitiş tarihi geçersiz format",
        severity: "CRITICAL",
      });
    }

    // Check premium values
    if (!result.primBilgileri?.toplamPrim || result.primBilgileri.toplamPrim <= 0) {
      flags.push({
        field: "primBilgileri.toplamPrim",
        currentValue: result.primBilgileri?.toplamPrim,
        confidence: 20,
        reason: "Toplam prim değeri eksik veya geçersiz",
        severity: "CRITICAL",
      });
    }

    if (!result.primBilgileri?.netPrim || result.primBilgileri.netPrim <= 0) {
      flags.push({
        field: "primBilgileri.netPrim",
        currentValue: result.primBilgileri?.netPrim,
        confidence: 50,
        reason: "Net prim değeri eksik",
        severity: "WARNING",
      });
    }

    // Check policy type
    if (!result.policeTipi || result.policeTipi === "diger") {
      flags.push({
        field: "policeTipi",
        currentValue: result.policeTipi,
        confidence: 60,
        reason: "Poliçe tipi belirsiz veya genel kategori",
        severity: "WARNING",
      });
    }

    // Check teminatlar
    if (!result.teminatlar || result.teminatlar.length === 0) {
      flags.push({
        field: "teminatlar",
        currentValue: null,
        confidence: 50,
        reason: "Teminat listesi bulunamadı",
        severity: "WARNING",
      });
    }

    return flags;
  }

  /**
   * Perform secondary verification using Haiku 4.5 self-correction
   */
  private async performSecondaryVerification(
    originalResult: ExtractionResult,
    pdfText: string,
    criticalFlags: ConfidenceFlag[]
  ): Promise<Partial<ExtractionResult>> {
    const flaggedFields = criticalFlags.map((f) => f.field).join(", ");

    const verificationPrompt = `Sen bir Türk sigorta poliçesi doğrulama uzmanısın.

ÖNCEKİ ÇIKARIM:
- Poliçe No: ${originalResult.policeNumarasi || "BULUNAMADI"}
- Şirket: ${originalResult.sigortaSirketi || "BULUNAMADI"}
- Başlangıç: ${originalResult.baslangicTarihi || "BULUNAMADI"}
- Bitiş: ${originalResult.bitisTarihi || "BULUNAMADI"}
- Toplam Prim: ${originalResult.primBilgileri?.toplamPrim || "BULUNAMADI"} ${originalResult.primBilgileri?.paraBirimi || ""}

DÜŞÜK GÜVENİLİRLİK TESPİT EDİLEN ALANLAR: ${flaggedFields}

POLİÇE METNİ (ilk 8000 karakter):
${pdfText.slice(0, 8000)}

GÖREV:
1. Poliçe metnini tekrar incele
2. SADECE yukarıdaki düşük güvenilirlik tespit edilen alanları düzelt
3. Eğer metinde bulunmuyorsa "BULUNAMADI" yaz
4. STRICT JSON formatında döndür:

{
  "policeNumarasi": "düzeltilmiş değer veya BULUNAMADI",
  "sigortaSirketi": "düzeltilmiş değer veya BULUNAMADI",
  "baslangicTarihi": "YYYY-MM-DD veya BULUNAMADI",
  "bitisTarihi": "YYYY-MM-DD veya BULUNAMADI",
  "toplamPrim": sayısal değer veya null,
  "netPrim": sayısal değer veya null
}

SADECE JSON döndür, başka hiçbir açıklama ekleme.`;

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2048,
      temperature: 0, // Zero temperature for deterministic verification
      system: "Sen hassas veri çıkarımı yapan bir sistemsin. SADECE JSON döndür.",
      messages: [
        {
          role: "user",
          content: verificationPrompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify(body),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const rawText = responseBody.content[0].text;

    // Parse JSON response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Secondary verification returned invalid JSON");
    }

    const verified = JSON.parse(jsonMatch[0]);

    // Map to ExtractionResult format
    const verifiedFields: Partial<ExtractionResult> = {};

    if (verified.policeNumarasi && verified.policeNumarasi !== "BULUNAMADI") {
      verifiedFields.policeNumarasi = verified.policeNumarasi;
    }

    if (verified.sigortaSirketi && verified.sigortaSirketi !== "BULUNAMADI") {
      verifiedFields.sigortaSirketi = verified.sigortaSirketi;
    }

    if (verified.baslangicTarihi && verified.baslangicTarihi !== "BULUNAMADI") {
      verifiedFields.baslangicTarihi = verified.baslangicTarihi;
    }

    if (verified.bitisTarihi && verified.bitisTarihi !== "BULUNAMADI") {
      verifiedFields.bitisTarihi = verified.bitisTarihi;
    }

    if (verified.toplamPrim !== null || verified.netPrim !== null) {
      verifiedFields.primBilgileri = {
        ...originalResult.primBilgileri,
        toplamPrim: verified.toplamPrim || originalResult.primBilgileri?.toplamPrim || 0,
        netPrim: verified.netPrim || originalResult.primBilgileri?.netPrim || 0,
        paraBirimi: originalResult.primBilgileri?.paraBirimi || "TRY",
        bsmv: 0,
        thgf: 0,
        odemeSekli: "pesin",
        taksitSayisi: 1
      };
    }

    logger.info("Secondary verification completed", "ConfidenceCalibrator", {
      verifiedFieldCount: Object.keys(verifiedFields).length,
    });

    return verifiedFields;
  }

  /**
   * Calculate overall confidence score after verification
   */
  private calculateOverallConfidence(
    original: ExtractionResult,
    verified: Partial<ExtractionResult>,
    flags: ConfidenceFlag[]
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    // Critical fields weight: 15 points each
    const criticalFieldWeights = {
      policeNumarasi: 15,
      sigortaSirketi: 15,
      baslangicTarihi: 15,
      bitisTarihi: 15,
      "primBilgileri.toplamPrim": 15,
    };

    // Check each critical field
    for (const [field, weight] of Object.entries(criticalFieldWeights)) {
      const flag = flags.find((f) => f.field === field && f.severity === "CRITICAL");

      if (!flag) {
        // No critical flag = full score
        totalScore += weight;
      } else if (verified && this.isFieldVerified(field, verified)) {
        // Verified successfully = 90% of weight
        totalScore += weight * 0.9;
      } else {
        // Not verified = 0 points
        totalScore += 0;
      }

      totalWeight += weight;
    }

    // Add remaining 25 points for optional fields
    const hasValidteminatlar = original.teminatlar && original.teminatlar.length > 0;
    const hasValidpoliceTipi = original.policeTipi && original.policeTipi !== "diger";

    totalScore += hasValidteminatlar ? 15 : 0;
    totalScore += hasValidpoliceTipi ? 10 : 0;
    totalWeight += 25;

    return Math.round((totalScore / totalWeight) * 100);
  }

  /**
   * Check if a field was successfully verified
   */
  private isFieldVerified(field: string, verified: Partial<ExtractionResult>): boolean {
    if (field === "primBilgileri.toplamPrim") {
      return verified.primBilgileri?.toplamPrim !== undefined && verified.primBilgileri.toplamPrim !== null && verified.primBilgileri.toplamPrim > 0;
    }

    return (verified as Record<string, unknown>)[field] !== undefined && (verified as Record<string, unknown>)[field] !== null;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private isValidDate(dateString?: string | null): boolean {
    if (!dateString) return false;

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}

/**
 * Singleton instance
 */
export const confidenceCalibrator = new ConfidenceCalibrator();

