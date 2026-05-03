// ============================================
// Unified AI Service - Core Orchestrator
// Single entry point for all AI operations
// ============================================

import { BedrockAdapter } from "./adapters/bedrockAdapter";
import { GeminiAdapter } from "./adapters/geminiAdapter";
import { metricsCollector } from "./metrics/metricsCollector";
import type {
  AIRequest,
  AIResponse,
  AIProvider,
  AIAdapter,
  AIError,
  AICallMetadata,
} from "./types";

class AIService {
  private providers: Map<AIProvider, AIAdapter>;
  private requestCounter = 0;

  constructor() {
    this.providers = new Map([
      ["bedrock", new BedrockAdapter() as unknown as AIAdapter],
      ["gemini", new GeminiAdapter() as unknown as AIAdapter],
    ]);
  }

  /**
   * Main entry point for all AI operations
   * Handles provider selection, fallback, and metrics tracking
   */
  async callAI<TInput, TOutput>(request: AIRequest<TInput>): Promise<AIResponse<TOutput>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Determine provider order (primary + fallbacks)
    const providerOrder = this.getProviderOrder(request);

    let lastError: AIError | undefined;
    let attemptCount = 0;
    const failedProviders: AIProvider[] = [];

    for (const provider of providerOrder) {
      attemptCount++;

      try {
        const adapter = this.providers.get(provider);
        if (!adapter) {
          throw new Error(`Provider ${provider} not available`);
        }

        // Invoke provider
        const result = await adapter.invoke<TInput, TOutput>(
          request.operation,
          request.input,
          request.options
        );

        // Extract token estimates (if available)
        const { tokensInput, tokensOutput } = this.estimateTokens(request, result);

        // Calculate cost
        const estimatedCostUSD = adapter.estimateCost(tokensInput, tokensOutput);

        // Extract confidence score (if extraction result)
        const confidenceScore = this.extractConfidenceScore(result);

        // Build metadata
        const metadata: AICallMetadata = {
          requestId,
          operation: request.operation,
          provider,
          modelId: this.getModelId(provider),
          timestamp: new Date().toISOString(),
          latencyMs: Date.now() - startTime,
          tokensInput,
          tokensOutput,
          estimatedCostUSD,
          confidenceScore,
          tenantId: request.options?.tenantId,
          userId: request.options?.userId,
          fallbackUsed: attemptCount > 1,
          attemptCount,
          failedProviders: failedProviders.length > 0 ? failedProviders : undefined,
          promptVersion: "v1.0.0", // TODO: Track prompt versions
        };

        // Log metrics (async, non-blocking)
        metricsCollector.log(metadata).catch((err) => {
          console.error("[AIService] Failed to log metrics:", err);
        });

        return {
          success: true,
          data: result,
          metadata,
        };
      } catch (error) {
        failedProviders.push(provider);
        lastError = this.mapError(error, provider);

        // If error is not recoverable or fallback disabled, break
        if (!lastError.recoverable || request.options?.enableFallback === false) {
          break;
        }

        // Continue to next provider
        console.warn(`[AIService] ${provider} failed, trying next provider:`, lastError.message);
      }
    }

    // All providers failed - log failure metrics
    const metadata: AICallMetadata = {
      requestId,
      operation: request.operation,
      provider: failedProviders[0] || "bedrock",
      modelId: this.getModelId(failedProviders[0] || "bedrock"),
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      tokensInput: 0,
      tokensOutput: 0,
      estimatedCostUSD: 0,
      tenantId: request.options?.tenantId,
      userId: request.options?.userId,
      fallbackUsed: attemptCount > 1,
      attemptCount,
      failedProviders,
      promptVersion: "v1.0.0",
    };

    metricsCollector.log(metadata).catch((err) => {
      console.error("[AIService] Failed to log failure metrics:", err);
    });

    return {
      success: false,
      error: lastError,
      metadata,
    };
  }

  /**
   * Determine provider order (primary + fallbacks)
   */
  private getProviderOrder(request: AIRequest): AIProvider[] {
    const preferred = request.options?.preferredProvider || "bedrock";
    const order: AIProvider[] = [preferred];

    // Add fallback providers if enabled
    if (request.options?.enableFallback !== false) {
      if (preferred !== "gemini") order.push("gemini");
      if (preferred !== "bedrock") order.push("bedrock");
    }

    return order;
  }

  /**
   * Map error to standardized AIError format
   */
  private mapError(error: unknown, provider: AIProvider): AIError {
    const message = error instanceof Error ? error.message : String(error);

    // Determine if error is recoverable (should trigger fallback)
    const recoverable = this.isRecoverableError(message);

    return {
      code: this.extractErrorCode(message),
      message,
      provider,
      recoverable,
      fallbackUsed: false,
    };
  }

  /**
   * Check if error is recoverable (worth trying fallback)
   */
  private isRecoverableError(message: string): boolean {
    const lowerMsg = message.toLowerCase();

    // Recoverable errors
    if (lowerMsg.includes("timeout")) return true;
    if (lowerMsg.includes("throttl")) return true; // ThrottlingException
    if (lowerMsg.includes("rate limit")) return true;
    if (lowerMsg.includes("503")) return true; // Service unavailable
    if (lowerMsg.includes("429")) return true; // Too many requests

    // Non-recoverable errors
    if (lowerMsg.includes("invalid api key")) return false;
    if (lowerMsg.includes("authentication")) return false;

    // Default: recoverable
    return true;
  }

  /**
   * Extract error code from message
   */
  private extractErrorCode(message: string): string {
    if (message.includes("ThrottlingException")) return "THROTTLED";
    if (message.includes("timeout")) return "TIMEOUT";
    if (message.includes("429")) return "RATE_LIMIT";
    if (message.includes("503")) return "SERVICE_UNAVAILABLE";
    return "UNKNOWN_ERROR";
  }

  /**
   * Estimate tokens (rough approximation)
   */
  private estimateTokens(
    request: AIRequest,
    result: unknown
  ): { tokensInput: number; tokensOutput: number } {
    // Rough estimate: 1 token ≈ 4 characters
    const inputStr = JSON.stringify(request.input);
    const outputStr = JSON.stringify(result);

    return {
      tokensInput: Math.ceil(inputStr.length / 4),
      tokensOutput: Math.ceil(outputStr.length / 4),
    };
  }

  /**
   * Extract confidence score from result (if present)
   */
  private extractConfidenceScore(result: unknown): number | undefined {
    if (typeof result === "object" && result !== null) {
      const obj = result as Record<string, unknown>;
      if (typeof obj.guvenScore === "number") return obj.guvenScore;
      if (typeof obj.confidenceScore === "number") return obj.confidenceScore;
      if (typeof obj.summary === "object" && obj.summary !== null) {
        const summary = obj.summary as Record<string, unknown>;
        if (typeof summary.optimizationScore === "number") return summary.optimizationScore;
      }
    }
    return undefined;
  }

  /**
   * Get model ID for provider
   */
  private getModelId(provider: AIProvider): string {
    if (provider === "bedrock") {
      return process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-haiku-4-5-20251001-v1:0";
    }
    if (provider === "gemini") {
      return "gemini-2.0-flash"; // Most common fallback model
    }
    return "unknown";
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    this.requestCounter++;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ai_${timestamp}_${random}_${this.requestCounter}`;
  }
}

// Singleton instance
export const aiService = new AIService();
