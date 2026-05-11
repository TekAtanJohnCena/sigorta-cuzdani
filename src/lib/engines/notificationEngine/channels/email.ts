import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { NotificationCategory } from '@/types/notification';
import { logger } from '@/lib/logger';

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  category: NotificationCategory;
  tenantId: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASS) — emails will be logged only', 'EmailChannel');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

function buildHtml(subject: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #0f172a; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 20px;">Sigorta Cuzdani</h1>
  </div>
  <div style="background: #fff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
    <h2 style="color: #1e293b; margin: 0 0 12px;">${subject}</h2>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 20px;">${body}</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      Bu e-posta Sigorta Cuzdani bildirim sistemi tarafindan gonderilmistir.
    </p>
  </div>
</body>
</html>`.trim();
}

export async function sendEmailNotification(payload: EmailPayload): Promise<void> {
  const smtp = getTransporter();
  const html = buildHtml(payload.subject, payload.body);

  if (!smtp) {
    logger.info('[EMAIL MOCK] Would send email', 'EmailChannel', {
      to: payload.to,
      subject: payload.subject,
      category: payload.category,
    });
    return;
  }

  try {
    const info = await smtp.sendMail({
      from: `"Sigorta Cuzdani" <${process.env.SMTP_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html,
    });

    logger.info(`Email sent: ${info.messageId}`, 'EmailChannel', {
      to: payload.to,
      tenantId: payload.tenantId,
    });
  } catch (error) {
    logger.error('Failed to send email notification', 'EmailChannel', error);
    throw error;
  }
}
