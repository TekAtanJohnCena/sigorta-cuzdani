import { PolicyType } from './policy';

export interface RiskAssessment {
  id: string;
  tenantId: string;
  companyId: string;
  assessmentDate: string;
  overallScore: number;
  scoreBreakdown: {
    coverageAdequacy: number;
    limitAdequacy: number;
    regulatoryCompliance: number;
    diversification: number;
  };
  gaps: RiskGap[];
  recommendations: RiskRecommendation[];
  nextReviewDate: string;
  createdAt: string;
}

export interface RiskGap {
  type: 'missing_coverage' | 'insufficient_limit' | 'regulatory' | 'expiring';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  financialExposure: number;
  policyType?: PolicyType;
  estimatedCost: { min: number; max: number };
  deadline?: string;
}

export interface RiskRecommendation {
  priority: number;
  action: string;
  expectedBenefit: string;
  estimatedCost: { min: number; max: number };
  timeframe: 'immediate' | '30_days' | '90_days' | '6_months';
}

export interface CompanyOnboardingStatus {
  tenantId: string;
  companyId: string;
  profileComplete: boolean;
  sector?: string;
  annualRevenue?: number;
  employeeCount?: number;
  completedAt?: string;
}
