export interface Tenant {
  id: string;
  companyName: string;
  email: string;
  packageType: string;
  endDate: string;
  startDate?: string;
  isActive?: boolean;
  policyCount?: number;
  userCount?: number;
  notes?: string;
  durationDays?: number;
  uid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantStats {
  tenantId?: string;
  policyCount: number;
  userCount: number;
  lastLogin?: string;
}

export interface CreateTenantRequest {
  email: string;
  password: string;
  companyName: string;
  packageType: string;
  durationDays: number;
  notes?: string;
}

export interface ExtendSubscriptionRequest {
  tenantId: string;
  durationDays: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
