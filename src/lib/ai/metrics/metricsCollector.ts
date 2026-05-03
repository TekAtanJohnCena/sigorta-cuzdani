// ============================================
// AI Metrics Collector - Async Firestore Logging
// Tracks all AI operations for cost/quality analysis
// ============================================

import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import app from "@/lib/firebase/config";
import type { AICallMetadata, AIMetricsDocument } from "../types";
import { logger } from "@/lib/logger";

export class MetricsCollector {
  private batchQueue: AIMetricsDocument[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT_MS = 5000;

  /**
   * Log AI call metrics (async, non-blocking)
   * Batches writes for efficiency
   */
  async log(metadata: AICallMetadata): Promise<void> {
    // Structured console log with [AI_METRIC] prefix for easy filtering
    console.info("[AI_METRIC]", JSON.stringify(metadata));

    // Also log to standard logger for Sentry/Datadog integration
    logger.info("AI call tracked", "aiMetrics", {
      operation: metadata.operation,
      provider: metadata.provider,
      latencyMs: metadata.latencyMs,
      estimatedCostUSD: metadata.estimatedCostUSD,
      confidenceScore: metadata.confidenceScore,
      fallbackUsed: metadata.fallbackUsed,
      tenantId: metadata.tenantId,
    });

    // Convert to Firestore document
    const document: AIMetricsDocument = {
      id: metadata.requestId,
      tenantId: metadata.tenantId || "system",
      operation: metadata.operation,
      provider: metadata.provider,
      modelId: metadata.modelId,
      timestamp: Timestamp.now(),

      latencyMs: metadata.latencyMs,
      tokensInput: metadata.tokensInput || 0,
      tokensOutput: metadata.tokensOutput || 0,
      estimatedCostUSD: metadata.estimatedCostUSD || 0,

      confidenceScore: metadata.confidenceScore,
      success: metadata.attemptCount === 1 && !metadata.fallbackUsed,
      errorCode: metadata.fallbackUsed ? "FALLBACK_USED" : undefined,

      fallbackUsed: metadata.fallbackUsed,
      attemptCount: metadata.attemptCount,

      promptVersion: metadata.promptVersion,
    };

    // Add to batch queue
    this.batchQueue.push(document);

    // Flush if batch size reached
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      await this.flush();
    } else {
      // Start batch timer if not already running
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.flush(), this.BATCH_TIMEOUT_MS);
      }
    }
  }

  /**
   * Flush queued metrics to Firestore
   */
  private async flush(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Get items to flush
    const items = [...this.batchQueue];
    this.batchQueue = [];

    try {
      const db = getFirestore(app);
      const metricsCollection = collection(db, "aiMetrics");

      // Write all metrics (fire and forget)
      const promises = items.map((doc) => addDoc(metricsCollection, doc));

      // Don't block on completion
      Promise.all(promises).catch((error) => {
        logger.error("Failed to write AI metrics to Firestore", "metricsCollector", {
          error: error.message,
          count: items.length,
        });
      });
    } catch (error) {
      logger.error("Failed to initialize Firestore for metrics", "metricsCollector", {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Force flush (for graceful shutdown)
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();
