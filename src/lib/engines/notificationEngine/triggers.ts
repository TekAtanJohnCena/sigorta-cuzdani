import { NotificationCategory, NotificationPriority, NotificationChannel } from '@/types/notification';
import { sendInAppNotification } from './channels/inApp';
import { sendEmailNotification } from './channels/email';
import { sendSmsNotification } from './channels/sms';
import { getExpiryWarningTemplate, getClaimUpdateTemplate, getRiskAlertTemplate } from './templates';
import { logger } from '@/lib/logger';

export interface TriggerEvent {
  type: NotificationCategory;
  tenantId: string;
  companyId: string;
  recipientUserId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  departmentId?: string;
  payload: Record<string, unknown>;
}

interface TriggerConfig {
  priority: NotificationPriority;
  channels: NotificationChannel[];
}

function resolveTriggerConfig(event: TriggerEvent): TriggerConfig {
  switch (event.type) {
    case 'policy_expiry': {
      const days = (event.payload.daysUntilExpiry as number) || 30;
      if (days <= 1) return { priority: 'critical', channels: ['in_app', 'email', 'sms'] };
      if (days <= 7) return { priority: 'high', channels: ['in_app', 'email'] };
      if (days <= 15) return { priority: 'medium', channels: ['in_app', 'email'] };
      return { priority: 'low', channels: ['in_app'] };
    }
    case 'claim_update':
      return { priority: 'high', channels: ['in_app', 'email'] };
    case 'risk_alert':
      return { priority: 'high', channels: ['in_app', 'email'] };
    case 'payment_reminder':
      return { priority: 'medium', channels: ['in_app', 'email'] };
    case 'renewal_action':
      return { priority: 'medium', channels: ['in_app'] };
    case 'system':
      return { priority: 'low', channels: ['in_app'] };
    default:
      return { priority: 'low', channels: ['in_app'] };
  }
}

function resolveTemplate(event: TriggerEvent): { title: string; body: string; actionUrl?: string } {
  switch (event.type) {
    case 'policy_expiry':
      return getExpiryWarningTemplate(event.payload);
    case 'claim_update':
      return getClaimUpdateTemplate(event.payload);
    case 'risk_alert':
      return getRiskAlertTemplate(event.payload);
    default:
      return {
        title: 'Bildirim',
        body: String(event.payload.message || 'Yeni bir bildiriminiz var.'),
      };
  }
}

export async function processTrigger(event: TriggerEvent): Promise<void> {
  logger.info(`Processing trigger: ${event.type}`, 'Triggers', { tenantId: event.tenantId });

  const config = resolveTriggerConfig(event);
  const template = resolveTemplate(event);

  const baseNotification = {
    tenantId: event.tenantId,
    companyId: event.companyId,
    category: event.type,
    priority: config.priority,
    channels: config.channels,
    title: template.title,
    body: template.body,
    actionUrl: template.actionUrl,
    recipient: {
      userId: event.recipientUserId || 'company_admin',
      email: event.recipientEmail,
      phone: event.recipientPhone,
    },
    departmentId: event.departmentId,
    metadata: event.payload as Record<string, unknown>,
  };

  const promises: Promise<void>[] = [];

  if (config.channels.includes('in_app')) {
    promises.push(sendInAppNotification(baseNotification));
  }

  if (config.channels.includes('email') && event.recipientEmail) {
    promises.push(sendEmailNotification({
      to: event.recipientEmail,
      subject: template.title,
      body: template.body,
      category: event.type,
      tenantId: event.tenantId,
    }));
  }

  if (config.channels.includes('sms') && event.recipientPhone) {
    promises.push(sendSmsNotification({
      to: event.recipientPhone,
      message: `${template.title}: ${template.body}`,
      tenantId: event.tenantId,
    }));
  }

  await Promise.allSettled(promises);
  logger.info(`Trigger processed: ${event.type}`, 'Triggers', { channels: config.channels });
}
