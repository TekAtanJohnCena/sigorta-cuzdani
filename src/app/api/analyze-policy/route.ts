import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { logger } from "@/lib/logger";
import { withAuth } from "@/lib/api/withAuth";
import type {
  RiskAlert,
  RawAnalysisFromLLM,
  AnalysisResponse,
  AnalysisErrorResponse,
} from "@/types/policy-analysis";

// ============================================
// POST /api/analyze-policy
// Poliçe metnindeki "Gizli Mayınları" tespit eder:
// istisnaları, yüksek muafiyetleri ve eksik teminatları
// ============================================

export const maxDuration = 60;

/** Bedrock istemcisi — mevcut proje credentials'ı ile */
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const MODEL_ID =
  process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-haiku-4-5-20251001-v1:0";

/** Maksimum gönderilecek karakter sayısı (maliyet optimizasyonu) */
const MAX_TEXT_LENGTH = 20_000;

/** Minimum anlamlı metin uzunluğu */
const MIN_TEXT_LENGTH = 50;

// ─── System Prompt ────────────────────────────────────────────────────────────

const RISK_ANALYSIS_SYSTEM_PROMPT = `Sen kıdemli bir Kurumsal Risk Analisti ve Aktüerya uzmanısın. Sana verilen sigorta poliçesi metnini analiz edeceksin. Görevin, poliçedeki "Gizli Mayınları" bulmaktır.

Arayacağın üç kategori:
1. İSTİSNALAR: Şirketi iflasa sürükleyebilecek kapsam dışı durumlar (deprem, siber saldırı, terör, sel, iş durması vb.)
2. MUAFİYETLER: Yüksek tenzili muafiyetler, poliçeyi pratikte kullanılamaz hale getiren finansal eşikler
3. EKSİKLİKLER: Sektörel olarak beklenen ancak poliçede bulunmayan kritik teminatlar

CFO'nun anlayacağı basitlikte, doğrudan finansal riske odaklanan çıktılar üret.

ÇIKTIN SADECE VE SADECE JSON OLMALIDIR. Markdown kod bloğu (\`\`\`) KULLANMA. Açıklama yazma. Sadece JSON döndür.

JSON şeması:
{
  "alerts": [
    {
      "title": "Kısa, net başlık (max 60 karakter)",
      "description": "Riskin ne olduğu ve finansal olarak neye yol açacağı. Spesifik ol, genel ifadeler kullanma.",
      "severity": "CRITICAL veya WARNING veya INFO",
      "financialImpact": "Örn: %20 Tenzili Muafiyet | ₺500.000 üst limit | 48 saat bildirim zorunluluğu (yoksa bu alanı dahil etme)"
    }
  ],
  "summary": "Poliçenin genel risk durumu hakkında CFO'ya yönelik 2 cümlelik özet."
}

Kurallar:
- severity=CRITICAL: Tazminat alınamamasına veya büyük finansal kayba yol açar
- severity=WARNING: Dikkat edilmeli, yenileme döneminde müzakere ile iyileştirilebilir
- severity=INFO: Bilgilendirme, acil aksiyon gerektirmiyor
- Minimum 2, maksimum 10 alert üret
- Türkçe yaz, profesyonel kurumsal dil kullan
- Poliçede net bir şekilde yazan bilgileri kullan, tahmin yapma`;

// ─── JSON Parse Yardımcı Fonksiyonu ──────────────────────────────────────────

function parseAnalysisJson(rawText: string): RawAnalysisFromLLM {
  // Markdown code block temizleme (LLM bazen kural dışı döndürür)
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as RawAnalysisFromLLM;
  } catch {
    // Fallback: JSON bloğunu bulmaya çalış
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as RawAnalysisFromLLM;
    }
    throw new Error(
      `LLM yanıtı JSON formatında değil. İlk 300 karakter: ${cleaned.slice(0, 300)}`
    );
  }
}

// ─── Severity Doğrulama ───────────────────────────────────────────────────────

const VALID_SEVERITIES = new Set<string>(["CRITICAL", "WARNING", "INFO"]);

function normalizeSeverity(value: unknown): RiskAlert["severity"] {
  if (typeof value === "string" && VALID_SEVERITIES.has(value.toUpperCase())) {
    return value.toUpperCase() as RiskAlert["severity"];
  }
  return "WARNING"; // Güvenli varsayılan
}

// ─── Ana Handler ─────────────────────────────────────────────────────────────

export const POST = withAuth(async (
  req: NextRequest,
  { tenantId, uid }
): Promise<NextResponse<AnalysisResponse | AnalysisErrorResponse>> => {
  const requestId = randomUUID().slice(0, 8); // Kısa istek kimliği
  logger.info("Policy risk analysis started", "analyze-policy", { requestId, tenantId, uid });

  // 1. Input Validation ──────────────────────────────────────────────────────
  let policyText: string;

  try {
    const body = await req.json();
    policyText = body?.policyText;
  } catch {
    logger.warn("Invalid JSON body", "analyze-policy", { requestId });
    return NextResponse.json<AnalysisErrorResponse>(
      { isSuccess: false, error: "Geçersiz istek formatı." },
      { status: 400 }
    );
  }

  if (!policyText || typeof policyText !== "string") {
    logger.warn("Missing policyText", "analyze-policy", { requestId });
    return NextResponse.json<AnalysisErrorResponse>(
      { isSuccess: false, error: "Poliçe metni (policyText) zorunludur." },
      { status: 400 }
    );
  }

  const trimmed = policyText.trim();

  if (trimmed.length < MIN_TEXT_LENGTH) {
    logger.warn("policyText too short", "analyze-policy", {
      requestId,
      length: trimmed.length,
    });
    return NextResponse.json<AnalysisErrorResponse>(
      {
        isSuccess: false,
        error: `Poliçe metni çok kısa (${trimmed.length} karakter). Anlamlı bir analiz için en az ${MIN_TEXT_LENGTH} karakter gereklidir.`,
      },
      { status: 400 }
    );
  }

  // Uzun metinleri kırp — Bedrock token maliyeti optimizasyonu
  const textToAnalyze = trimmed.slice(0, MAX_TEXT_LENGTH);
  logger.info("Input validated", "analyze-policy", {
    requestId,
    originalLength: trimmed.length,
    sentLength: textToAnalyze.length,
    truncated: trimmed.length > MAX_TEXT_LENGTH,
  });

  // 2. Bedrock API Çağrısı ───────────────────────────────────────────────────
  let rawLLMResponse: RawAnalysisFromLLM;

  try {
    const bedrockPayload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: RISK_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Aşağıdaki sigorta poliçesi metnini analiz et ve SADECE JSON formatında gizli mayınları (istisna, muafiyet ve eksik teminat) raporla:\n\n${textToAnalyze}`,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(bedrockPayload),
    });

    logger.info("Calling Bedrock", "analyze-policy", { requestId, modelId: MODEL_ID });
    const bedrockResponse = await bedrock.send(command);
    const responseBody = JSON.parse(
      new TextDecoder().decode(bedrockResponse.body)
    );
    const rawText: string = responseBody.content?.[0]?.text ?? "";

    if (!rawText) {
      throw new Error("Bedrock'tan boş yanıt alındı.");
    }

    rawLLMResponse = parseAnalysisJson(rawText);
  } catch (bedrockErr) {
    const errMsg = bedrockErr instanceof Error ? bedrockErr.message : "Bilinmeyen hata";
    logger.error("Bedrock call failed", "analyze-policy", {
      requestId,
      error: errMsg,
    });
    return NextResponse.json<AnalysisErrorResponse>(
      {
        isSuccess: false,
        error: "Yapay zeka analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      },
      { status: 500 }
    );
  }

  // 3. Yanıtı Normalize Et & ID Ata ─────────────────────────────────────────
  let alerts: RiskAlert[];

  try {
    if (!Array.isArray(rawLLMResponse.alerts)) {
      throw new Error("alerts alanı dizi değil.");
    }

    alerts = rawLLMResponse.alerts
      .filter(
        (a) =>
          a &&
          typeof a.title === "string" &&
          typeof a.description === "string"
      )
      .map((a) => ({
        id: randomUUID(),
        title: String(a.title).slice(0, 120),
        description: String(a.description).slice(0, 800),
        severity: normalizeSeverity(a.severity),
        ...(a.financialImpact && typeof a.financialImpact === "string"
          ? { financialImpact: String(a.financialImpact).slice(0, 200) }
          : {}),
      }));

    if (alerts.length === 0) {
      throw new Error("Geçerli alert üretilemedi.");
    }
  } catch (parseErr) {
    const errMsg = parseErr instanceof Error ? parseErr.message : "Parse hatası";
    logger.error("Alert normalization failed", "analyze-policy", {
      requestId,
      error: errMsg,
    });
    return NextResponse.json<AnalysisErrorResponse>(
      {
        isSuccess: false,
        error: "Analiz sonucu işlenirken hata oluştu.",
      },
      { status: 500 }
    );
  }

  const summary =
    typeof rawLLMResponse.summary === "string" && rawLLMResponse.summary.trim()
      ? rawLLMResponse.summary.trim().slice(0, 600)
      : "Poliçe analizi tamamlandı.";

  logger.info("Analysis complete", "analyze-policy", {
    requestId,
    alertCount: alerts.length,
    criticalCount: alerts.filter((a) => a.severity === "CRITICAL").length,
  });

  // 4. Başarılı Yanıt ────────────────────────────────────────────────────────
  return NextResponse.json<AnalysisResponse>({
    isSuccess: true,
    alerts,
    summary,
  });
});
