import { NextRequest, NextResponse } from "next/server";
import { getPoliciesByTenant, saveAnalysisResults } from "@/lib/firebase/firestore";
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

export const maxDuration = 60; // Set to max for long AI analyses

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: "Oturum bilgisi bulunamadı." }, { status: 401 });
    }

    console.log(`[API /api/ai/analyze-portfolio] Fetching policies for tenant: ${tenantId}`);
    
    // 1. Fetch policies from Firestore
    const policies = await getPoliciesByTenant(tenantId);
    
    // Check if enough policies to analyze
    if (!policies || policies.length === 0) {
      return NextResponse.json({ 
        message: "Analiz edilecek poliçe bulunamadı.",
        data: null 
      });
    }

    // 2. Prepare payload for Haiku
    const simplifiedPolicies = policies.map((p: any) => ({
      tipi: p.policyType,
      sirket: p.insuranceCompany,
      tarihler: { baslangic: p.startDate, bitis: p.endDate },
      prim: p.premium,
      teminatlar: p.coverages?.map((c: any) => ({
        ad: c.name,
        tutar: c.amount,
      })),
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

    console.log(`[API /api/ai/analyze-portfolio] Invoking Claude Haiku...`);
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(bedrockBody),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const rawText = responseBody.content?.[0]?.text ?? "";

    // 3. Clean up and Parse Response
    const cleanJson = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanJson);
    } catch (e) {
      console.error("[API /api/ai/analyze-portfolio] Failed to parse JSON:", cleanJson.substring(0, 200));
      return NextResponse.json({ error: "AI geçersiz bir yanıt döndürdü." }, { status: 500 });
    }

    // 4. Save results to Firestore for persistence
    try {
      await saveAnalysisResults(tenantId, analysisResult);
    } catch (saveErr) {
      console.warn("[API /api/ai/analyze-portfolio] Failed to persist analysis results:", saveErr);
      // We don't fail the whole request if save fails, but we log it
    }

    console.log(`[API /api/ai/analyze-portfolio] Analysis complete.`);
    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error: any) {
    console.error(`[API /api/ai/analyze-portfolio] Error:`, error);
    return NextResponse.json(
      { error: "Poliçeler analiz edilirken hata oluştu.", details: error.message },
      { status: 500 }
    );
  }
}
