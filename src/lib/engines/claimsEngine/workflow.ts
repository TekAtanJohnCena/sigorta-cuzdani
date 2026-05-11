import { ClaimStatus, VALID_CLAIM_TRANSITIONS, CLAIM_SLA_DAYS, ClaimSLA } from '@/types/claim';

export class ClaimWorkflowError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ClaimWorkflowError';
  }
}

export function validateTransition(currentStatus: ClaimStatus, targetStatus: ClaimStatus): void {
  const allowed = VALID_CLAIM_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    throw new ClaimWorkflowError(
      `Gecersiz durum gecisi: ${currentStatus} → ${targetStatus}. Izin verilen: ${allowed?.join(', ') || 'yok'}`,
      'INVALID_TRANSITION'
    );
  }
}

export function calculateSLA(
  currentStatus: ClaimStatus,
  statusEnteredAt: string,
  policyType: string
): ClaimSLA {
  const slaConfig = CLAIM_SLA_DAYS[policyType] || CLAIM_SLA_DAYS.default;
  const maxDays = slaConfig[currentStatus] || 7;

  const enteredDate = new Date(statusEnteredAt);
  const deadlineDate = new Date(enteredDate);
  deadlineDate.setDate(deadlineDate.getDate() + maxDays);

  const now = new Date();
  const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    currentStatus,
    statusEnteredAt,
    deadlineDate: deadlineDate.toISOString(),
    daysRemaining,
    isOverdue: daysRemaining < 0,
  };
}

export function calculateResolutionDays(createdAt: string, resolvedAt: string): number {
  const start = new Date(createdAt);
  const end = new Date(resolvedAt);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function buildStatusHistoryEntry(status: ClaimStatus, note?: string) {
  return {
    status,
    timestamp: new Date().toISOString(),
    ...(note && { note }),
  };
}
