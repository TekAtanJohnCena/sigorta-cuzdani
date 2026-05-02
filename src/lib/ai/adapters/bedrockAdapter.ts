// ============================================
// AWS Bedrock Adapter - Claude Haiku 4.5
// Unified wrapper for Bedrock AI calls with metrics
// ============================================

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import type {
  AIAdapter,
  AIOperation,
  AIRequestOptions,
  ExtractionResult,
  RiskAnalysisResult,
  PortfolioAnalysisResult,
  AI_PRICING,
} from "../types";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-haiku-4-5-20251001-v1:0";

export class BedrockAdapter implements AIAdapter {
  readonly provider = "bedrock" as const;

  /**
   * Main invocation method for all Bedrock operations
   */
  async invoke<TInput, TOutput>(
    operation: AIOperation,
    input: TInput,
    options?: AIRequestOptions
  ): Promise<TOutput> {
    switch (operation) {
      case "extractPolicy":
        return this.extractPolicy(input as Buffer) as Promise<TOutput>;

      case "analyzePortfolio":
        return this.analyzePortfolio(input as any) as Promise<TOutput>;

      case "analyzeRisk":
        return this.analyzeRisk(input as any) as Promise<TOutput>;

      default:
        throw new Error(`Operation ${operation} not supported by BedrockAdapter`);
    }
  }

  /**
   * Extract policy data from PDF buffer
   */
  private async extractPolicy(pdfBuffer: Buffer): Promise<ExtractionResult> {
    // 1. Extract text from PDF
    const data = await pdfParse(pdfBuffer);
    const pdfText = data.text;

    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error("PDF metin içeriği okunamadı (taranmış görüntü veya şifreli olabilir)");
    }

    // 2. Optimize for Haiku token limits (first 15k chars)
    const truncatedText = pdfText.slice(0, 15000);

    // 3. Build request body
    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: this.getPolicyExtractionSystemPrompt(),
      messages: [
        {
          role: "user",
          content: `Aşağıdaki Türk sigorta poliçesi metnini analiz et ve JSON formatında döndür:\n\n${truncatedText}`,
        },
      ],
    };

    // 4. Invoke Bedrock
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // 5. Parse response
    const text = responseBody.content?.[0]?.text ?? "";
    const parsed = this.parseJsonResponse<ExtractionResult>(text);

    return {
      ...parsed,
      modelUsed: MODEL_ID,
    };
  }

  /**
   * Analyze portfolio for gaps and overlaps
   */
  private async analyzePortfolio(input: {
    policies: any[];
    companyProfile: any;
  }): Promise<PortfolioAnalysisResult> {
    const { policies, companyProfile } = input;

    // Build summary of all policies
    const policySummary = policies
      .map(
        (p) =>
          `- ${p.policyType}: ${p.policyNumber} (${p.company}, ${p.coverages.length} teminat, ${p.premium} TL)`
      )
      .join("\n");

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: this.getPortfolioAnalysisSystemPrompt(),
      messages: [
        {
          role: "user",
          content: `Şirket Profili:
Sektör: ${companyProfile.industry || "Bilinmiyor"}
Çalışan Sayısı: ${companyProfile.employeeCount || "Bilinmiyor"}

Poliçe Portföyü:
${policySummary}

Bu portföyde teminat eksiklikleri, tekrarlar ve optimizasyon fırsatlarını analiz et.`,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.content?.[0]?.text ?? "";

    const parsed = this.parseJsonResponse<PortfolioAnalysisResult>(text);
    return parsed;
  }

  /**
   * Analyze individual policy for hidden risks
   */
  private async analyzeRisk(input: {
    policyText: string;
    policyType: string;
  }): Promise<RiskAnalysisResult> {
    const { policyText, policyType } = input;

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: this.getRiskAnalysisSystemPrompt(policyType),
      messages: [
        {
          role: "user",
          content: `Aşağıdaki ${policyType} poliçesi metnini analiz et ve gizli riskleri tespit et:\n\n${policyText}`,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.content?.[0]?.text ?? "";

    const parsed = this.parseJsonResponse<RiskAnalysisResult>(text);
    return parsed;
  }

  /**
   * Parse JSON response from Claude (handles code blocks)
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
      throw new Error("Claude yaniti JSON formatinda degil: " + clean.slice(0, 400));
    }
  }

  /**
   * Estimate cost for Bedrock call
   */
  estimateCost(tokensInput: number, tokensOutput: number): number {
    const pricing =
      (AI_PRICING.bedrock as any)[MODEL_ID] ||
      AI_PRICING.bedrock["us.anthropic.claude-haiku-4-5-20251001-v1:0"];

    const inputCost = (tokensInput / 1000) * pricing.inputPer1kTokens;
    const outputCost = (tokensOutput / 1000) * pricing.outputPer1kTokens;

    return inputCost + outputCost;
  }

  // ============================================
  // System Prompts (Centralized)
  // ============================================

  private getPolicyExtractionSystemPrompt(): string {
    return `Sen bir Türk sigorta poliçesi analiz uzmanısın. Sana verilen poliçe metninden yapılandırılmış veri çıkaracaksın.

KURALLAR:
1. Sadece metinde gördüğün bilgileri çıkar. Tahmin yapma.
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

  private getPortfolioAnalysisSystemPrompt(): string {
    return `Sen Türk şirketleri için sigorta portföyü analiz uzmanısın. Teminat eksiklikleri, tekrarlar ve optimizasyon fırsatlarını tespit ediyorsun.

GÖREV: Verilen poliçe portföyünü analiz et ve JSON formatında rapor döndür.

JSON şeması:
{
  "tenantId": "string",
  "analyzedAt": "ISO 8601 timestamp",
  "policyCount": number,
  "insights": [
    {
      "type": "overlap" | "gap" | "inefficiency" | "concentration_risk",
      "title": "string",
      "description": "string",
      "affectedPolicies": ["policy-id"],
      "potentialSavings": number (optional),
      "riskExposure": number (optional),
      "recommendation": "string",
      "priority": "high" | "medium" | "low"
    }
  ],
  "summary": {
    "totalSavingsOpportunity": number,
    "totalRiskExposure": number,
    "criticalGaps": number,
    "optimizationScore": number
  }
}`;
  }

  private getRiskAnalysisSystemPrompt(policyType: string): string {
    return `Sen Türk sigorta poliçelerindeki GİZLİ MAYINLARI tespit eden bir uzmansın.

GÖREV: ${policyType} poliçesindeki istisnalar, yüksek muafiyetler ve eksik teminatları analiz et.

JSON şeması:
{
  "policyId": "string",
  "analyzedAt": "ISO 8601",
  "alerts": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "severity": "CRITICAL" | "WARNING" | "INFO",
      "category": "exclusion" | "deductible" | "coverage_gap" | "limit_inadequacy" | "claim_barrier",
      "affectedCoverages": ["string"],
      "regulatoryRisk": boolean,
      "financialImpact": "string (optional)",
      "remediationSteps": ["string"],
      "estimatedRemediationCost": number (optional),
      "confidenceScore": number
    }
  ],
  "summary": {
    "criticalCount": number,
    "warningCount": number,
    "infoCount": number,
    "totalRiskExposure": number,
    "actionableInsights": number
  }
}`;
  }
}
