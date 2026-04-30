import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getPoliciesByTenant, saveAnalysisResults } from "@/lib/firebase/firestore";
import { Policy, Coverage } from "@/types/policy";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { PORTFOLIO_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/analysisPrompts";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-haiku-4-5-20251001-v1:0";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = body.tenantId;

    if (!tenantId || typeof tenantId !== "string" || tenantId.length > 128) {
      return NextResponse.json({ error: "Geçersiz oturum bilgisi." }, { status: 401 });
    }

    logger.info("Portfolio analysis started", "api/ai/analyze-portfolio", { tenantId });

    const policies = await getPoliciesByTenant(tenantId);

    if (!policies || policies.length === 0) {
      return NextResponse.json({
        message: "Analiz edilecek poliçe bulunamadı.",
        data: null,
      });
    }

    const simplifiedPolicies = (policies as unknown as Policy[]).map((p: Policy) => ({
      tipi: p.policyType,
      sirket: p.insuranceCompany,
      tarihler: { baslangic: p.startDate, bitis: p.endDate },
      prim: p.premium,
      teminatlar: p.coverages?.map((c: Coverage) => ({ ad: c.name, tutar: c.amount })),
      kapsam: p.notes,
    }));

    const policiesJson = JSON.stringify(simplifiedPolicies, null, 2);

    const bedrockBody = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: PORTFOLIO_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Aşağıdaki poliçe portföyünü analiz et ve SADECE istenen formata uygun JSON çıktısı ver:\n\n${policiesJson}`,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(bedrockBody),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const rawText = responseBody.content?.[0]?.text ?? "";

    const cleanJson = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanJson);
    } catch {
      logger.error("AI response parse failed", "api/ai/analyze-portfolio", {
        tenantId,
        preview: cleanJson.substring(0, 100),
      });
      return NextResponse.json({ error: "AI analiz sonucu işlenemedi." }, { status: 500 });
    }

    try {
      await saveAnalysisResults(tenantId, analysisResult);
    } catch (saveErr) {
      logger.warn("Failed to persist analysis", "api/ai/analyze-portfolio", {
        error: (saveErr as Error).message,
      });
    }

    logger.info("Portfolio analysis complete", "api/ai/analyze-portfolio", { tenantId });

    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error) {
    logger.error("Portfolio analysis error", "api/ai/analyze-portfolio", {
      error: (error as Error).message,
    });
    // İç hata detaylarını gizle
    return NextResponse.json(
      { error: "Portföy analizi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
