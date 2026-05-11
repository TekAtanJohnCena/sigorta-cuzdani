import { checkPolicyExpiries } from './expiryChecker';
import { processTrigger, TriggerEvent } from './triggers';
import { logger } from '@/lib/logger';

export { checkPolicyExpiries } from './expiryChecker';
export { processTrigger, type TriggerEvent } from './triggers';

export async function runScheduledExpiryCheck(tenantId: string, companyId: string): Promise<number> {
  logger.info(`Running scheduled expiry check`, 'NotificationEngine', { tenantId });

  const results = await checkPolicyExpiries(tenantId, companyId);

  let notificationCount = 0;
  for (const result of results) {
    await processTrigger({
      type: 'policy_expiry',
      tenantId,
      companyId,
      payload: {
        policyId: result.policyId,
        policyNumber: result.policyNumber,
        policyType: result.policyType,
        insuranceCompany: result.insuranceCompany,
        daysUntilExpiry: result.daysUntilExpiry,
        endDate: result.endDate,
        premium: result.premium,
        warningLevel: result.warningLevel,
      },
    });
    notificationCount++;
  }

  logger.info(
    `Expiry check complete: ${notificationCount} notifications triggered`,
    'NotificationEngine',
    { tenantId, count: notificationCount }
  );

  return notificationCount;
}
