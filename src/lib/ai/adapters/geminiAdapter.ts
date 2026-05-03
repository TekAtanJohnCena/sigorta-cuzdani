// ============================================
// Google Gemini Adapter - Fallback Provider
// Multi-model cascade with retry logic
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  AIAdapter,
  AIOperation,
  AIRequestOptions,
  ExtractionResult,
} from "../types";
import { AI_PRICING } from "../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Models ordered by speed/cost (fastest first)
const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"] as const;

export class GeminiAdapter implements AIAdapter {
  readonly provider = "gemini" as const;

  /**
   * Main invocation method with multi-model fallback
   */
  async invoke<TInput, TOutput>(
    operation: AIOperation,
    input: TInput,
    options?: AIRequestOptions
  ): Promise<TOutput> {
    if (operation === "extractPolicy") {
      return this.extractPolicyWithFallback(input as any) as Promise<TOutput>;
    }

    throw new Error(`Operation ${operation} not supported by GeminiAdapter yet`);
  }

  /**
   * Extract policy from PDF with model cascade
   */
  private async extractPolicyWithFallback(input: {
    pdfBase64: string;
    mimeType?: string;
  }): Promise<ExtractionResult> {
    const { pdfBase64, mimeType = "application/pdf" } = input;
    let lastError: Error | null = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
          { inlineData: { data: pdfBase64, mimeType } },
          this.getPolicyExtractionPrompt(),
        ]);

        const text = result.response.text().trim();
        const parsed = this.parseJsonResponse<ExtractionResult>(text);

        return {
          ...parsed,
          modelUsed: modelName,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = err instanceof Error ? err : new Error(msg);

        // If rate limited, wait before trying next model
        if (this.isRateLimitError(msg)) {
          await this.sleep(4000);
        }

        // If quota exceeded, skip remaining models
        if (msg.toLowerCase().includes("quota")) {
          break;
        }
      }
    }

    throw lastError ?? new Error("Tüm Gemini modelleri başarısız oldu");
  }

  /**
   * Parse JSON response (handles code blocks)
   */
  private parseJsonResponse<T>(text: string): T {
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(clean) as T;
    } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]) as T;
      throw new Error("AI yaniti JSON formatinda degil: " + clean.slice(0, 300));
    }
  }

  /**
   * Estimate cost for Gemini call
   */
  estimateCost(tokensInput: number, tokensOutput: number): number {
    // Use gemini-2.0-flash pricing (most commonly used fallback)
    const pricing = (AI_PRICING.gemini as any)["gemini-2.0-flash"] || {
      inputPer1kTokens: 0.000075,
      outputPer1kTokens: 0.0003,
    };

    const inputCost = (tokensInput / 1000) * pricing.inputPer1kTokens;
    const outputCost = (tokensOutput / 1000) * pricing.outputPer1kTokens;

    return inputCost + outputCost;
  }

  /**
   * Check if error is rate limit related
   */
  private isRateLimitError(message: string): boolean {
    const lowerMsg = message.toLowerCase();
    return lowerMsg.includes("429") || lowerMsg.includes("rate limit") || lowerMsg.includes("quota");
  }

  /**
   * Sleep utility for rate limit backoff
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Policy extraction prompt (Turkish insurance domain)
   */
  private getPolicyExtractionPrompt(): string {
    return `Sen bir Türk sigorta poliçesi analiz uzmanısın. Sana verilen poliçe PDF'inden yapılandırılmış veri çıkaracaksın.

KURALLAR:
1. Sadece PDF'de gördüğün bilgileri çıkar. Tahmin yapma.
2. Emin olmadığın alanları null olarak işaretle.
3. Para tutarlarını sayısal değer olarak ver (noktalama/TL işareti olmadan).
4. Tarihleri YYYY-MM-DD formatında ver.
5. SADECE JSON döndür, açıklama veya ek bilgi yazma.

JSON şeması:
{
  "policeTipi": "kasko | trafik | yangin | saglik | nakliyat | isyeri | dask | ferdi_kaza | sorumluluk | muhendislik | tarim | diger",
  "policeNumarasi": "string veya null",
  "sigortaSirketi": "string veya null",
  "acenteAdi": "string veya null",
  "acenteNo": "string veya null",
  "baslangicTarihi": "YYYY-MM-DD veya null",
  "bitisTarihi": "YYYY-MM-DD veya null",
  "sigortaEttiren": { "unvan": "string veya null", "vergiNo": "string veya null", "adres": "string veya null" },
  "sigortali": { "unvan": "string veya null", "vergiNo": "string veya null", "adres": "string veya null" },
  "teminatlar": [{ "teminatAdi": "string", "teminatTutari": number, "paraBirimi": "TRY"|"USD"|"EUR", "muafiyet": number|null, "muafiyetTipi": "yuzde"|"tutar"|null }],
  "primBilgileri": { "netPrim": number|null, "bsmv": number|null, "thgf": number|null, "toplamPrim": number|null, "paraBirimi": "TRY", "odemeSekli": "pesin"|"taksitli"|null, "taksitSayisi": number|null },
  "ozelSartlar": ["string"],
  "guvenScore": number
}`;
  }
}
