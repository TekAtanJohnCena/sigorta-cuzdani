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
} from "../types";
import { AI_PRICING } from "../types";
import { generateDomainContext } from "../context/insuranceRules";

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
   * Analyze portfolio with DEEP cross-policy logic
   * Detects overlaps, gaps, concentration risks, and optimization opportunities
   */
  private async analyzePortfolio(input: {
    policies: any[];
    companyProfile: any;
  }): Promise<PortfolioAnalysisResult> {
    const { policies, companyProfile } = input;

    // Enhanced policy summary with structured coverage details
    const policyDetails = policies.map((p) => ({
      id: p.id,
      tipi: p.policyType,
      sirket: p.insuranceCompany,
      policeNo: p.policyNumber,
      baslangic: p.startDate,
      bitis: p.endDate,
      prim: p.premium,
      teminatlar: p.coverages?.map((c: any) => ({
        ad: c.name,
        limit: c.amount,
        paraBirimi: c.currency || "TRY",
        muafiyet: c.deductible,
      })),
      durum: p.status,
    }));

    // Build company context
    let companyContext = "Şirket profili bilinmiyor.";
    if (companyProfile) {
      companyContext = `Şirket Profili:
- Sektör: ${companyProfile.sector || "Bilinmiyor"}
- Yıllık Ciro: ${companyProfile.annualRevenue ? companyProfile.annualRevenue.toLocaleString("tr-TR") + " TL" : "Bilinmiyor"}
- Çalışan Sayısı: ${companyProfile.employeeCount || "Bilinmiyor"}`;
    }

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: this.getEnhancedPortfolioAnalysisSystemPrompt(),
      messages: [
        {
          role: "user",
          content: `${companyContext}

Poliçe Portföyü (${policies.length} poliçe):
${JSON.stringify(policyDetails, null, 2)}

GÖREV: Bu portföyü DERİN analiz et. Sadece yüzeysel özetleme değil, CROSS-POLICY mantık ile:
1. TEKRARLAR: Aynı riskin birden fazla poliçede teminat altına alınması (gereksiz maliyet)
2. AÇIKLAR: Şirketin sektörüne göre eksik olan kritik teminatlar
3. KONSANTRASYONlar: Aynı sigorta şirketine bağımlılık riski
4. LİMİT YETERSİZLİKLERİ: Enflasyon/ciro göz önüne alındığında düşük limitler

JSON formatında döndür (SADECE JSON, açıklama yok).`,
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

    // Enrich with calculated fields
    return {
      ...parsed,
      tenantId: input.policies[0]?.tenantId || "unknown",
      analyzedAt: new Date().toISOString(),
      policyCount: policies.length,
    };
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

  private getPolicyExtractionSystemPrompt(policyType?: string): string {
    // Inject domain-specific context based on detected policy type
    const domainContext = policyType ? generateDomainContext(policyType as any) : "";

    return `Sen bir Türk sigorta poliçesi analiz uzmanısın. Sana verilen poliçe metninden yapılandırılmış veri çıkaracaksın.

${domainContext}

KURALLAR:
1. Sadece metinde gördüğün bilgileri çıkar. Tahmin yapma.
2. Emin olmadığın alanları null olarak işaretle.
3. Para tutarlarını sayısal değer olarak ver (noktalama/TL işareti olmadan).
4. Tarihleri YYYY-MM-DD formatında ver.
5. SADECE JSON döndür, açıklama veya ek bilgi yazma.
6. Yukarıdaki mevzuat bilgilerini dikkate al ama metinde olmayan veriyi uydurma.

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

  private getEnhancedPortfolioAnalysisSystemPrompt(): string {
    // Inject comprehensive domain context for all policy types
    const domainContext = generateDomainContext();

    return `Sen Türk şirketleri için sigorta portföyü DERİN ANALİZ uzmanısın. Sadece yüzeysel özetleme değil, CROSS-POLICY mantık ile gizli riskleri ve optimizasyon fırsatlarını tespit ediyorsun.

${domainContext}

ÖZEL YETENEKLERİN:
1. **Teminat Çakışması Tespiti**: Aynı riskin birden fazla poliçede karşılanması (örn: Ferdi Kaza hem Kasko'da hem Sağlık'ta)
2. **Sektörel Boşluk Analizi**: Şirketin sektörüne göre eksik olan zorunlu/kritik teminatlar
3. **Konsantrasyon Riski**: Aynı sigorta şirketine aşırı bağımlılık (tek şirkette %70+ prim)
4. **Limit Yetersizliği**: Enflasyon/ciro/çalışan sayısına göre düşük kalan teminat limitleri (2024 TÜFE: %65)
5. **Zaman Boşlukları**: Poliçeler arası süreklilik kopukluğu (teminatsız dönemler)
6. **DASK Kontrolü**: ZDS minimum bina değeri kurallarına uyum (konut: 1.500 TL/m², işyeri: 2.000 TL/m²)
7. **İMM Yeterliliği**: Trafik sigortası mali mesuliyet limitleri (bedeni: 5M TL, maddi: 500k TL minimum)

JSON ŞEMASI (SADECE BU FORMATTA DÖNDÜR):
{
  "tenantId": "string",
  "analyzedAt": "ISO 8601",
  "policyCount": number,
  "insights": [
    {
      "type": "overlap" | "gap" | "inefficiency" | "concentration_risk",
      "title": "TÜRKÇE başlık (max 80 karakter)",
      "description": "Detaylı açıklama (neden sorun, potansiyel sonuçlar)",
      "affectedPolicies": ["policy-id1", "policy-id2"],
      "potentialSavings": number (TRY cinsinden, varsa),
      "riskExposure": number (TRY cinsinden risk tutarı, varsa),
      "recommendation": "Somut aksiyon adımları",
      "priority": "high" | "medium" | "low"
    }
  ],
  "summary": {
    "totalSavingsOpportunity": number (toplam tasarruf, TRY),
    "totalRiskExposure": number (toplam açık risk, TRY),
    "criticalGaps": number (yüksek öncelikli boşluk sayısı),
    "optimizationScore": number (0-100, 100 = mükemmel portföy)
  }
}

ÖNEMLI: insights dizisini ÖNCELIĞE göre sırala (high → medium → low).`;
  }

  private getRiskAnalysisSystemPrompt(policyType: string): string {
    return `Sen Türk sigorta poliçelerindeki GİZLİ MAYINLARI tespit eden UZMAN bir sigorta analistsin.

ÖZELLEŞTİRİLMİŞ GÖREV (${policyType.toUpperCase()} POLİÇESİ):
Poliçe metninde şu riskli durumları DERİNLEMESİNE ara:

1. **ZEYİLNAMELER**: Poliçeyi kısıtlayan ek maddeler
2. **MUAFİYET ORANLAR**: Hasar tazminatını engelleyecek yüksek muafiyetler
3. **TEMİNAT DIŞI HALLER**: Belirsiz veya geniş kapsamlı istisnalar
4. **LİMİT YETERSİZLİĞİ**: Güncel piyasa değerlerine göre düşük teminat limitleri
5. **BELİRSİZ İFADELER**: "makul süre", "gerekli özen" gibi subjektif terimler

TÜRK SİGORTA PİYASASI ÖZEL KURALLARI:
- ${policyType === "kasko" ? "Kasko: Değer kaybı teminatı kritik, yıllık enflasyon %50+ olabilir" : ""}
- ${policyType === "trafik" ? "Trafik: İMM (İhtiyari Mali Mesuliyet) minimum 500k TL olmalı" : ""}
- ${policyType === "isyeri" ? "İşyeri: DASK zorunlu, İşveren Sorumluluk teminatı şart" : ""}
- ${policyType === "yangin" ? "Yangın: Deprem ayrı (DASK), yeniden inşa maliyeti güncel olmalı" : ""}

TEHLİKELİ MADDE ÖRNEKLERİ:
- "Bakımsızlıktan kaynaklanan hasarlar teminat dışıdır" → Çok geniş istisna
- "Derhal bildirilmemiş hasarlar karşılanmaz" → "Derhal" tanımı belirsiz
- "Alkollü sürüş halinde teminat geçersizdir" → Tüm kazayı kapsıyor olabilir
- "%5 muafiyet uygulanır" → Küçük hasarlarda tazminat yok

JSON ÇIKTI ŞEMASI (SADECE JSON DÖNDÜR, AÇIKLAMA YOK):
{
  "policyId": "string",
  "analyzedAt": "ISO 8601 timestamp",
  "alerts": [
    {
      "id": "unique-id",
      "title": "Kısa başlık (TÜRKÇE, max 60 karakter)",
      "description": "Detaylı risk açıklaması (neden tehlikeli, potansiyel sonuç)",
      "severity": "CRITICAL" | "WARNING" | "INFO",
      "category": "exclusion" | "deductible" | "coverage_gap" | "limit_inadequacy" | "claim_barrier",
      "affectedCoverages": ["hangi teminatlar etkileniyor"],
      "regulatoryRisk": boolean (TSB düzenlemelerine aykırı mı?),
      "financialImpact": "Hasar durumunda kaç TL zarar olabilir (sayısal tahmin)",
      "remediationSteps": ["Somut aksiyon adımları", "Nasıl düzeltilir"],
      "estimatedRemediationCost": number (ek prim tahmini, TRY),
      "confidenceScore": number (0-100, bu tespitte ne kadar eminsin)
    }
  ],
  "summary": {
    "criticalCount": number,
    "warningCount": number,
    "infoCount": number,
    "totalRiskExposure": number (toplam potansiyel zarar, TRY),
    "actionableInsights": number (düzeltilebilir risk sayısı)
  }
}

ÖNEMLİ: Alerts dizisini severity'ye göre sırala (CRITICAL → WARNING → INFO).`;
  }
}
