// ============================================
// Policy Comparison Types
// For side-by-side comparison and shareable links
// ============================================

export interface PolicyComparison {
  id: string;
  tenantId: string;
  policyIds: string[];
  createdAt: string;
  createdBy: string;
  title?: string;
  notes?: string;
}

export interface ShareLink {
  id: string; // nanoid token (10 chars)
  tenantId: string;
  comparisonId: string;
  policyIds: string[];
  createdAt: string;
  expiresAt: string; // 24h from creation
  accessCount: number;
  lastAccessedAt?: string;
  isActive: boolean;
}

export interface ComparisonField {
  label: string;
  key: string;
  formatter?: (value: unknown) => string;
  highlightDifferences?: boolean;
}
