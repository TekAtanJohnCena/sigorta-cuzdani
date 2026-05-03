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
  currentValue: any;
  confidence: number;
  reason: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
}

export interface CalibrationResult {
  originalResult: ExtractionResult;
  verified: boolean;
  needsManualReview: boolean;
  isReliable: boolean; // TRUE if confidenceScore >= 85 and no critical flags remain
  flags: ConfidenceFlag[];
  verifiedFields?: Partial<ExtractionResult>;
  confidenceScore: number; // 0-100
  businessReadyForB2B: boolean; // Alias for clarity in B2B context
}

/**
 * Critical fields that must have high confidence (>= 85%) for B2B reliability
 */
const CRITICAL_FIELDS = [
  "policyNumber",
  "insuranceCompany",
  "startDate",
  "endDate",
  "premium.totalPremium",
  "premium.netPremium",
  "policyType",
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
      initialConfidence: extractionResult.confidenceScore,
    });

    const flags = this.analyzeConfidence(extractionResult);
    const criticalFlags = flags.filter((f) => f.severity === "CRITICAL");

    // If no critical flags, result is verified
    if (criticalFlags.length === 0) {
      const finalScore = extractionResult.confidenceScore || 100;
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
        confidenceScore: finalScore,
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
        confidenceScore: newConfidenceScore,
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
        confidenceScore: extractionResult.confidenceScore || 0,
      };
    }
  }

  /**
   * Analyze confidence scores for each field and generate flags
   */
  private analyzeConfidence(result: ExtractionResult): ConfidenceFlag[] {
    const flags: ConfidenceFlag[] = [];

    // Check policy number
    if (!result.policyNumber || result.policyNumber.length < 5) {
      flags.push({
        field: "policyNumber",
        currentValue: result.policyNumber,
        confidence: 40,
        reason: "Poliçe numarası eksik veya çok kısa",
        severity: "CRITICAL",
      });
    }

    // Check insurance company
    if (!result.insuranceCompany || result.insuranceCompany.length < 3) {
      flags.push({
        field: "insuranceCompany",
        currentValue: result.insuranceCompany,
        confidence: 40,
        reason: "Sigorta şirketi adı eksik",
        severity: "CRITICAL",
      });
    }

    // Check dates
    if (!this.isValidDate(result.startDate)) {
      flags.push({
        field: "startDate",
        currentValue: result.startDate,
        confidence: 30,
        reason: "Başlangıç tarihi geçersiz format",
        severity: "CRITICAL",
      });
    }

    if (!this.isValidDate(result.endDate)) {
      flags.push({
        field: "endDate",
        currentValue: result.endDate,
        confidence: 30,
        reason: "Bitiş tarihi geçersiz format",
        severity: "CRITICAL",
      });
    }

    // Check premium values
    if (!result.premium?.totalPremium || result.premium.totalPremium <= 0) {
      flags.push({
        field: "premium.totalPremium",
        currentValue: result.premium?.totalPremium,
        confidence: 20,
        reason: "Toplam prim değeri eksik veya geçersiz",
        severity: "CRITICAL",
      });
    }

    if (!result.premium?.netPremium || result.premium.netPremium <= 0) {
      flags.push({
        field: "premium.netPremium",
        currentValue: result.premium?.netPremium,
        confidence: 50,
        reason: "Net prim değeri eksik",
        severity: "WARNING",
      });
    }

    // Check policy type
    if (!result.policyType || result.policyType === "diger") {
      flags.push({
        field: "policyType",
        currentValue: result.policyType,
        confidence: 60,
        reason: "Poliçe tipi belirsiz veya genel kategori",
        severity: "WARNING",
      });
    }

    // Check coverages
    if (!result.coverages || result.coverages.length === 0) {
      flags.push({
        field: "coverages",
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
- Poliçe No: ${originalResult.policyNumber || "BULUNAMADI"}
- Şirket: ${originalResult.insuranceCompany || "BULUNAMADI"}
- Başlangıç: ${originalResult.startDate || "BULUNAMADI"}
- Bitiş: ${originalResult.endDate || "BULUNAMADI"}
- Toplam Prim: ${originalResult.premium?.totalPremium || "BULUNAMADI"} ${originalResult.premium?.currency || ""}

DÜŞÜK GÜVENİLİRLİK TESPİT EDİLEN ALANLAR: ${flaggedFields}

POLİÇE METNİ (ilk 8000 karakter):
${pdfText.slice(0, 8000)}

GÖREV:
1. Poliçe metnini tekrar incele
2. SADECE yukarıdaki düşük güvenilirlik tespit edilen alanları düzelt
3. Eğer metinde bulunmuyorsa "BULUNAMADI" yaz
4. STRICT JSON formatında döndür:

{
  "policyNumber": "düzeltilmiş değer veya BULUNAMADI",
  "insuranceCompany": "düzeltilmiş değer veya BULUNAMADI",
  "startDate": "YYYY-MM-DD veya BULUNAMADI",
  "endDate": "YYYY-MM-DD veya BULUNAMADI",
  "totalPremium": sayısal değer veya null,
  "netPremium": sayısal değer veya null
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

    if (verified.policyNumber && verified.policyNumber !== "BULUNAMADI") {
      verifiedFields.policyNumber = verified.policyNumber;
    }

    if (verified.insuranceCompany && verified.insuranceCompany !== "BULUNAMADI") {
      verifiedFields.insuranceCompany = verified.insuranceCompany;
    }

    if (verified.startDate && verified.startDate !== "BULUNAMADI") {
      verifiedFields.startDate = verified.startDate;
    }

    if (verified.endDate && verified.endDate !== "BULUNAMADI") {
      verifiedFields.endDate = verified.endDate;
    }

    if (verified.totalPremium !== null || verified.netPremium !== null) {
      verifiedFields.premium = {
        ...originalResult.premium,
        totalPremium: verified.totalPremium || originalResult.premium?.totalPremium || 0,
        netPremium: verified.netPremium || originalResult.premium?.netPremium || 0,
        currency: originalResult.premium?.currency || "TRY",
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
      policyNumber: 15,
      insuranceCompany: 15,
      startDate: 15,
      endDate: 15,
      "premium.totalPremium": 15,
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
    const hasValidCoverages = original.coverages && original.coverages.length > 0;
    const hasValidPolicyType = original.policyType && original.policyType !== "diger";

    totalScore += hasValidCoverages ? 15 : 0;
    totalScore += hasValidPolicyType ? 10 : 0;
    totalWeight += 25;

    return Math.round((totalScore / totalWeight) * 100);
  }

  /**
   * Check if a field was successfully verified
   */
  private isFieldVerified(field: string, verified: Partial<ExtractionResult>): boolean {
    if (field === "premium.totalPremium") {
      return verified.premium?.totalPremium !== undefined && verified.premium.totalPremium > 0;
    }

    return (verified as any)[field] !== undefined && (verified as any)[field] !== null;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private isValidDate(dateString?: string): boolean {
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
