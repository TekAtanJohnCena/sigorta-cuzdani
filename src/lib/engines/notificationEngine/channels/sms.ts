import { logger } from '@/lib/logger';

interface SmsPayload {
  to: string;
  message: string;
  tenantId: string;
}

// TODO: Netgsm veya Twilio entegrasyonu eklenecek
// Netgsm: https://www.netgsm.com.tr/dokuman
// Twilio: https://www.twilio.com/docs/sms

export async function sendSmsNotification(payload: SmsPayload): Promise<void> {
  logger.info('[SMS] SMS channel not yet configured — logging only', 'SmsChannel', {
    to: payload.to,
    messageLength: payload.message.length,
    tenantId: payload.tenantId,
  });
}
