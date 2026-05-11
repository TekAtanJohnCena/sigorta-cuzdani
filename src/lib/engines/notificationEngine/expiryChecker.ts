import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase/adminApp';
import { PolicyType } from '@/types/policy';
import { ExpiryCheckResult } from '@/types/notification';
import { logger } from '@/lib/logger';

const adminDb = getFirestore(getAdminApp());

const WARNING_THRESHOLDS = [60, 30, 15, 7, 1] as const;

function getWarningLevel(days: number): ExpiryCheckResult['warningLevel'] {
  if (days <= 1) return 'critical';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'warning';
  return 'info';
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function shouldNotify(daysLeft: number): boolean {
  return WARNING_THRESHOLDS.includes(daysLeft as typeof WARNING_THRESHOLDS[number]);
}

export async function checkPolicyExpiries(
  tenantId: string,
  companyId: string
): Promise<ExpiryCheckResult[]> {
  logger.info('Checking policy expiries', 'ExpiryChecker', { tenantId });

  const snapshot = await adminDb
    .collection('policies')
    .where('tenantId', '==', tenantId)
    .where('status', '==', 'active')
    .get();

  if (snapshot.empty) {
    logger.info('No active policies found', 'ExpiryChecker', { tenantId });
    return [];
  }

  const results: ExpiryCheckResult[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const endDate = data.endDate;
    if (!endDate) continue;

    const days = daysUntil(endDate);

    if (days < 0 || days > 60) continue;

    if (!shouldNotify(days)) continue;

    const alreadySent = await checkAlreadySent(tenantId, doc.id, days);
    if (alreadySent) continue;

    results.push({
      policyId: doc.id,
      policyNumber: data.policyNumber || '',
      policyType: (data.policyType || 'diger') as PolicyType,
      insuranceCompany: data.insuranceCompany || '',
      endDate,
      daysUntilExpiry: days,
      premium: data.premium?.totalPremium || data.totalPremium || 0,
      warningLevel: getWarningLevel(days),
    });
  }

  logger.info(`Found ${results.length} policies requiring notification`, 'ExpiryChecker', { tenantId });
  return results;
}

async function checkAlreadySent(
  tenantId: string,
  policyId: string,
  daysUntilExpiry: number
): Promise<boolean> {
  const existing = await adminDb
    .collection('notifications')
    .where('tenantId', '==', tenantId)
    .where('metadata.policyId', '==', policyId)
    .where('metadata.daysUntilExpiry', '==', daysUntilExpiry)
    .where('category', '==', 'policy_expiry')
    .limit(1)
    .get();

  return !existing.empty;
}
