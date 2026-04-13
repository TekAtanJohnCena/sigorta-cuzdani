// ============================================
// Sigorta Cüzdanı — Finance Types
// ============================================

export interface MonthlyView {
  month: string;          // "2025-04"
  label: string;          // "Nisan 2025"
  totalDue: number;
  totalPaid: number;
  remaining: number;
  items: CashFlowItem[];
}

export interface CashFlowItem {
  policyId: string;
  policyNumber: string;
  policyType: string;
  insuranceCompany: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface RiskScore {
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    coverageAdequacy: number;
    policyExpiration: number;
    paymentCompliance: number;
    diversification: number;
  };
  recommendations: RiskRecommendation[];
}

export interface RiskRecommendation {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  estimatedCost?: number;
}

export interface CoverageGap {
  area: string;
  severity: 'critical' | 'warning' | 'info';
  recommendation: string;
  estimatedCost?: number;
}

export interface DepartmentCost {
  department: string;
  totalPremium: number;
  policyCount: number;
  percentage: number;
}

export interface TypeCost {
  type: string;
  label: string;
  icon: string;
  totalPremium: number;
  policyCount: number;
  percentage: number;
  color: string;
}

export interface Alert {
  id: string;
  tenantId: string;
  type: 'expiry' | 'payment' | 'coverage_gap' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  policyId?: string;
  policyNumber?: string;
  dueDate?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  type: 'expiry' | 'payment' | 'renewal' | 'reminder';
  title: string;
  policyId?: string;
  policyNumber?: string;
  amount?: number;
  insuranceCompany?: string;
}
