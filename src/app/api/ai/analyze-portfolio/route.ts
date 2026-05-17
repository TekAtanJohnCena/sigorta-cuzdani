import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getPoliciesByTenant, saveAnalysisResults, getCompanyProfile } from "@/lib/firebase/firestore";
import { Policy } from "@/types/policy";
import { aiService } from "@/lib/ai/aiService";
import type { PortfolioAnalysisResult } from "@/lib/ai/types";
import { withAuth } from "@/lib/api/withAuth";

export const maxDuration = 60;

export const POST = withAuth(async (req: NextRequest, { tenantId, uid }) => {
  try {

    logger.info("Portfolio analysis started", "api/ai/analyze-portfolio", { tenantId });

    const policies = await getPoliciesByTenant(tenantId);

    if (!policies || policies.length === 0) {
      return NextResponse.json({
        message: "Analiz edilecek poliçe bulunamadı.",
        data: null,
      });
    }

    // Load company profile for enriched analysis
    let companyProfile: Record<string, unknown> | null = null;
    try {
      companyProfile = await getCompanyProfile(tenantId);
    } catch (e) {
      logger.warn("Failed to load company profile", "api/ai/analyze-portfolio", {
        error: (e as Error).message,
      });
    }

    // Call aiService with enhanced portfolio analysis
    const response = await aiService.callAI<
      { policies: Policy[]; companyProfile: Record<string, unknown> | null },
      PortfolioAnalysisResult
    >({
      operation: "analyzePortfolio",
      input: {
        policies: policies as unknown as Policy[],
        companyProfile,
      },
      options: {
        enableFallback: true,
        preferredProvider: "bedrock",
        tenantId,
      },
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Portfolio analysis failed");
    }

    const analysisResult = response.data;

    // Persist results to Firestore
    try {
      await saveAnalysisResults(tenantId, analysisResult as unknown as Record<string, unknown>);
    } catch (saveErr) {
      logger.warn("Failed to persist analysis", "api/ai/analyze-portfolio", {
        error: (saveErr as Error).message,
      });
    }

    logger.info("Portfolio analysis complete", "api/ai/analyze-portfolio", {
      tenantId,
      insightCount: analysisResult.insights.length,
      provider: response.metadata.provider,
      latencyMs: response.metadata.latencyMs,
      estimatedCostUSD: response.metadata.estimatedCostUSD,
    });

    return NextResponse.json({
      success: true,
      data: analysisResult,
      aiMetadata: {
        provider: response.metadata.provider,
        latencyMs: response.metadata.latencyMs,
        insightDepth: analysisResult.insights.length,
        fallbackUsed: response.metadata.fallbackUsed,
      },
    });
  } catch (error) {
    logger.error("Portfolio analysis error", "api/ai/analyze-portfolio", {
      error: (error as Error).message,
      tenantId,
    });
    // İç hata detaylarını gizle
    return NextResponse.json(
      { error: "Portföy analizi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
});
