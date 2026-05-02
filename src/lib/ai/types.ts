// ============================================
// Unified AI Service Type Definitions
// Centralized types for all AI operations
// ============================================

import type { Timestamp } from "firebase/firestore";

/** Supported AI operations across the platform */
export type AIOperation =
  | "extractPolicy"
  | "analyzePortfolio"
  | "analyzeRisk"
  | "predictClaim"
  | "summarizePolicy";

/** Available AI providers */
export type AIProvider = "bedrock" | "gemini" | "openai";

/** Policy types for Turkish insurance domain */
export type PolicyType =
  | "kasko"
  | "trafik"
  | "yangin"
  | "saglik"
  | "nakliyat"
  | "isyeri"
  | "dask"
  | "ferdi_kaza"
  | "sorumluluk"
  | "muhendislik"
  | "tarim"
  | "diger";

// ============================================
// Request/Response Interfaces
// ============================================

/** Unified AI request structure */
export interface AIRequest<T = unknown> {
  operation: AIOperation;
  input: T;
  options?: AIRequestOptions;
}

export interface AIRequestOptions {
  preferredProvider?: AIProvider;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  enableFallback?: boolean;
  skipCache?: boolean;
  tenantId?: string;
  userId?: string;
}

/** Unified AI response structure */
export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AIError;
  metadata: AICallMetadata;
}

export interface AIError {
  code: string;
  message: string;
  provider: AIProvider;
  recoverable: boolean;
  fallbackUsed?: boolean;
}

// ============================================
// Metrics & Observability
// ============================================

/** Comprehensive metadata for every AI call */
export interface AICallMetadata {
  // Identification
  requestId: string;
  operation: AIOperation;
  provider: AIProvider;
  modelId: string;
  timestamp: string;

  // Performance
  latencyMs: number;
  tokensInput?: number;
  tokensOutput?: number;

  // Cost (estimated)
  estimatedCostUSD?: number;

  // Quality
  confidenceScore?: number;

  // Context
  tenantId?: string;
  userId?: string;

  // Fallback tracking
  fallbackUsed: boolean;
  attemptCount: number;
  failedProviders?: AIProvider[];

  // Versioning
  promptVersion: string;
}

/** Firestore-ready metrics document */
export interface AIMetricsDocument {
  id: string;
  tenantId: string;
  operation: AIOperation;
  provider: AIProvider;
  modelId: string;
  timestamp: Timestamp;

  latencyMs: number;
  tokensInput: number;
  tokensOutput: number;
  estimatedCostUSD: number;

  confidenceScore?: number;
  success: boolean;
  errorCode?: string;

  fallbackUsed: boolean;
  attemptCount: number;

  promptVersion: string;
}

/** Daily aggregated metrics for reporting */
export interface AIMetricsAggregate {
  date: string; // YYYY-MM-DD
  tenantId?: string; // Null = global aggregate
  operation: AIOperation;

  totalCalls: number;
  successCount: number;
  failureCount: number;

  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;

  totalTokensInput: number;
  totalTokensOutput: number;
  totalCostUSD: number;

  avgConfidenceScore: number;

  fallbackRate: number; // Percentage

  providerBreakdown: {
    [provider in AIProvider]?: {
      calls: number;
      successRate: number;
      avgLatency: number;
    };
  };
}

// ============================================
// Domain-Specific Types (Policy Extraction)
// ============================================

/** Unified extraction result from PDF analysis */
export interface ExtractionResult {
  policeTipi: PolicyType;
  policeNumarasi: string | null;
  sigortaSirketi: string | null;
  acenteAdi: string | null;
  acenteNo: string | null;
  baslangicTarihi: string | null; // YYYY-MM-DD
  bitisTarihi: string | null; // YYYY-MM-DD
  sigortaEttiren: PolicyParty;
  sigortali: PolicyParty | null;
  teminatlar: Coverage[];
  primBilgileri: PremiumInfo;
  ozelSartlar: string[];
  guvenScore: number; // 0-100
  modelUsed?: string;
}

export interface PolicyParty {
  unvan: string | null;
  vergiNo: string | null;
  adres: string | null;
}

export interface Coverage {
  teminatAdi: string;
  teminatTutari: number;
  paraBirimi: "TRY" | "USD" | "EUR";
  muafiyet: number | null;
  muafiyetTipi: "yuzde" | "tutar" | null;
}

export interface PremiumInfo {
  netPrim: number | null;
  bsmv: number | null;
  thgf: number | null;
  toplamPrim: number | null;
  paraBirimi: "TRY" | "USD" | "EUR";
  odemeSekli: "pesin" | "taksitli" | null;
  taksitSayisi: number | null;
}

// ============================================
// Confidence & Quality Tracking
// ============================================

export interface ConfidenceBreakdown {
  overall: number; // 0-100
  byField: {
    [field: string]: {
      score: number;
      reason: string;
    };
  };
  flags: ConfidenceFlag[];
}

export interface ConfidenceFlag {
  type: "missing_critical" | "low_quality" | "ambiguous" | "warning";
  field: string;
  message: string;
}

export interface ExtractionQualityMetrics {
  policyId: string;
  tenantId: string;
  extractedAt: Timestamp;

  // Confidence breakdown
  overallConfidence: number;
  fieldConfidence: Record<string, number>;

  // Completeness
  criticalFieldsMissing: number;
  optionalFieldsMissing: number;

  // Quality flags
  flags: ConfidenceFlag[];

  // Manual review
  manuallyReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  correctionsMade: number;
}

// ============================================
// Risk Analysis Types
// ============================================

export type RiskSeverity = "CRITICAL" | "WARNING" | "INFO";

export type RiskCategory =
  | "exclusion"
  | "deductible"
  | "coverage_gap"
  | "limit_inadequacy"
  | "claim_barrier";

export interface RiskAlert {
  id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  category: RiskCategory;
  affectedCoverages: string[];
  regulatoryRisk: boolean;
  financialImpact?: string;
  remediationSteps: string[];
  estimatedRemediationCost?: number;
  confidenceScore: number;
  industryBenchmark?: {
    typical: string;
    current: string;
    deviation: number;
  };
}

export interface RiskAnalysisResult {
  policyId: string;
  analyzedAt: string;
  alerts: RiskAlert[];
  summary: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    totalRiskExposure: number;
    actionableInsights: number;
  };
}

// ============================================
// Portfolio Analysis Types
// ============================================

export type InsightType = "overlap" | "gap" | "inefficiency" | "concentration_risk";
export type InsightPriority = "high" | "medium" | "low";

export interface CrossPolicyInsight {
  type: InsightType;
  title: string;
  description: string;
  affectedPolicies: string[];
  potentialSavings?: number;
  riskExposure?: number;
  recommendation: string;
  priority: InsightPriority;
}

export interface PortfolioAnalysisResult {
  tenantId: string;
  analyzedAt: string;
  policyCount: number;
  insights: CrossPolicyInsight[];
  summary: {
    totalSavingsOpportunity: number;
    totalRiskExposure: number;
    criticalGaps: number;
    optimizationScore: number; // 0-100
  };
}

// ============================================
// Provider-Specific Adapter Interface
// ============================================

export interface AIAdapter {
  readonly provider: AIProvider;

  invoke<TInput, TOutput>(
    operation: AIOperation,
    input: TInput,
    options?: AIRequestOptions
  ): Promise<TOutput>;

  estimateCost(tokensInput: number, tokensOutput: number): number;
}

// ============================================
// Cost Estimation Constants
// ============================================

export const AI_PRICING = {
  bedrock: {
    "us.anthropic.claude-haiku-4-5-20251001-v1:0": {
      inputPer1kTokens: 0.00025, // $0.25 per 1M tokens
      outputPer1kTokens: 0.00125, // $1.25 per 1M tokens
    },
  },
  gemini: {
    "gemini-2.0-flash-lite": {
      inputPer1kTokens: 0.0,
      outputPer1kTokens: 0.0,
    },
    "gemini-2.0-flash": {
      inputPer1kTokens: 0.000075, // $0.075 per 1M tokens
      outputPer1kTokens: 0.0003, // $0.30 per 1M tokens
    },
    "gemini-2.5-flash": {
      inputPer1kTokens: 0.0001, // $0.10 per 1M tokens
      outputPer1kTokens: 0.0004, // $0.40 per 1M tokens
    },
  },
} as const;
