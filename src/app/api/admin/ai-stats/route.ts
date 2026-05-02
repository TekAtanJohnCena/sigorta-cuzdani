import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/firebase/withAuth";
import { db } from "@/lib/firebase/admin";

/**
 * GET /api/admin/ai-stats
 * Returns aggregated AI metrics for admin dashboard
 * Admin-only access
 */
export const GET = withAuth(async (req: NextRequest, user) => {
  // Check admin role
  if (user.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        error: "Bu sayfaya erişim yetkiniz yok.",
      },
      { status: 403 }
    );
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all AI metrics from last 30 days
    const metricsSnapshot = await db
      .collection("aiMetrics")
      .where("timestamp", ">=", thirtyDaysAgo.toISOString())
      .get();

    if (metricsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        data: {
          totalCalls: 0,
          totalCostUSD: 0,
          averageLatencyMs: 0,
          providerBreakdown: [],
          operationBreakdown: [],
          topRisks: [],
          last30Days: [],
        },
      });
    }

    const metrics = metricsSnapshot.docs.map((doc) => doc.data());

    // Aggregate stats
    const totalCalls = metrics.length;
    const totalCostUSD = metrics.reduce((sum, m) => sum + (m.estimatedCostUSD || 0), 0);
    const averageLatencyMs =
      metrics.reduce((sum, m) => sum + (m.latencyMs || 0), 0) / totalCalls;

    // Provider breakdown
    const providerMap = new Map<
      string,
      { calls: number; costUSD: number; totalLatency: number }
    >();
    metrics.forEach((m) => {
      const provider = m.provider || "unknown";
      const existing = providerMap.get(provider) || { calls: 0, costUSD: 0, totalLatency: 0 };
      providerMap.set(provider, {
        calls: existing.calls + 1,
        costUSD: existing.costUSD + (m.estimatedCostUSD || 0),
        totalLatency: existing.totalLatency + (m.latencyMs || 0),
      });
    });
    const providerBreakdown = Array.from(providerMap.entries()).map(([provider, data]) => ({
      provider,
      calls: data.calls,
      costUSD: data.costUSD,
      avgLatency: data.totalLatency / data.calls,
    }));

    // Operation breakdown
    const operationMap = new Map<string, { calls: number; totalLatency: number }>();
    metrics.forEach((m) => {
      const operation = m.operation || "unknown";
      const existing = operationMap.get(operation) || { calls: 0, totalLatency: 0 };
      operationMap.set(operation, {
        calls: existing.calls + 1,
        totalLatency: existing.totalLatency + (m.latencyMs || 0),
      });
    });
    const operationBreakdown = Array.from(operationMap.entries()).map(([operation, data]) => ({
      operation,
      calls: data.calls,
      avgLatency: data.totalLatency / data.calls,
    }));

    // Top detected risks (from risk analysis operations)
    const riskMap = new Map<string, number>();
    // This would require parsing stored risk alerts from Firestore
    // For now, return placeholder data
    const topRisks = [
      { category: "İstisna Maddesi", count: 12 },
      { category: "Yüksek Muafiyet", count: 8 },
      { category: "Teminat Eksikliği", count: 6 },
      { category: "Yetersiz Limit", count: 4 },
      { category: "Hasar Engeli", count: 2 },
    ];

    // Daily breakdown for 30-day trend
    const dailyMap = new Map<string, { calls: number; costUSD: number }>();
    metrics.forEach((m) => {
      const date = m.timestamp ? m.timestamp.split("T")[0] : "";
      if (!date) return;
      const existing = dailyMap.get(date) || { calls: 0, costUSD: 0 };
      dailyMap.set(date, {
        calls: existing.calls + 1,
        costUSD: existing.costUSD + (m.estimatedCostUSD || 0),
      });
    });

    // Fill in missing days with 0s
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const data = dailyMap.get(dateStr) || { calls: 0, costUSD: 0 };
      last30Days.push({
        date: dateStr,
        calls: data.calls,
        costUSD: data.costUSD,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCalls,
        totalCostUSD,
        averageLatencyMs,
        providerBreakdown,
        operationBreakdown,
        topRisks,
        last30Days,
      },
    });
  } catch (error) {
    console.error("[API] /api/admin/ai-stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Metrikler yüklenirken hata oluştu",
      },
      { status: 500 }
    );
  }
});
