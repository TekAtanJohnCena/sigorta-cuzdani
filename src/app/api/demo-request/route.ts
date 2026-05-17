/**
 * Demo Request API Endpoint
 *
 * Public endpoint for demo request form submissions.
 * Sends formatted email to admin with demo request details.
 *
 * POST /api/demo-request
 * - No authentication required (public form)
 * - Validates required fields
 * - Sends email via SMTP (configured in .env.local)
 * - Returns success/error status
 */

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from '@/lib/logger';

interface DemoRequestPayload {
  name: string;
  email: string;
  company: string;
  phone: string;
  policyCount: string;
  message?: string;
  date: string;
  time: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('SMTP credentials not configured — demo request email cannot be sent', 'DemoRequestAPI');
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

function buildDemoRequestHtml(data: DemoRequestPayload): string {
  const dateObj = new Date(data.date);
  const formattedDate = dateObj.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px 24px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 8px;">🎯</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Yeni Demo Talebi</h1>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 32px 24px;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 24px; line-height: 1.5;">
          <strong>${data.company}</strong> firmasından yeni bir demo talebi aldınız.
        </p>

        <!-- Contact Info -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #3b82f6;">
              <div style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Yetkili Kişi</div>
              <div style="color: #111827; font-size: 16px; font-weight: 600;">${data.name}</div>
            </td>
          </tr>
        </table>

        <!-- Details Grid -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 12px 12px 12px 0; width: 50%; vertical-align: top;">
              <div style="color: #6b7280; font-size: 12px; font-weight: 600; margin-bottom: 4px;">📧 E-posta</div>
              <div style="color: #111827; font-size: 14px;">
                <a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none;">${data.email}</a>
              </div>
            </td>
            <td style="padding: 12px 0 12px 12px; width: 50%; vertical-align: top;">
              <div style="color: #6b7280; font-size: 12px; font-weight: 600; margin-bottom: 4px;">📞 Telefon</div>
              <div style="color: #111827; font-size: 14px;">
                <a href="tel:${data.phone}" style="color: #3b82f6; text-decoration: none;">${data.phone}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 12px 12px 0; width: 50%; vertical-align: top;">
              <div style="color: #6b7280; font-size: 12px; font-weight: 600; margin-bottom: 4px;">🏢 Şirket</div>
              <div style="color: #111827; font-size: 14px;">${data.company}</div>
            </td>
            <td style="padding: 12px 0 12px 12px; width: 50%; vertical-align: top;">
              <div style="color: #6b7280; font-size: 12px; font-weight: 600; margin-bottom: 4px;">📋 Poliçe Sayısı</div>
              <div style="color: #111827; font-size: 14px;">${data.policyCount}</div>
            </td>
          </tr>
        </table>

        <!-- Meeting Time -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px; background: linear-gradient(135deg, #dbeafe, #ede9fe); border-radius: 8px; text-align: center;">
              <div style="color: #4338ca; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Tercih Edilen Demo Zamanı</div>
              <div style="color: #1e1b4b; font-size: 18px; font-weight: 700; margin-bottom: 4px;">📅 ${formattedDate}</div>
              <div style="color: #4338ca; font-size: 16px; font-weight: 600;">🕐 ${data.time}</div>
            </td>
          </tr>
        </table>

        ${data.message ? `
        <!-- Message -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <div style="color: #92400e; font-size: 12px; font-weight: 600; margin-bottom: 8px;">💬 Ek Mesaj</div>
              <div style="color: #78350f; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</div>
            </td>
          </tr>
        </table>
        ` : ''}

        <!-- Action Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 24px;">
          <tr>
            <td style="text-align: center;">
              <a href="mailto:${data.email}?subject=Sigorta%20Cüzdanı%20Demo%20Toplantısı"
                 style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Hemen Yanıtla
              </a>
            </td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
          Bu e-posta <strong>Sigorta Cüzdanı</strong> demo talep formu üzerinden otomatik olarak gönderilmiştir.<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: #3b82f6; text-decoration: none;">sigortacuzdani.net</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: DemoRequestPayload = await request.json();

    // Validate required fields
    const { name, email, company, phone, policyCount, date, time } = body;

    if (!name || !email || !company || !phone || !policyCount || !date || !time) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Zorunlu alanlar eksik'
          }
        },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Geçersiz e-posta adresi'
          }
        },
        { status: 400 }
      );
    }

    const smtp = getTransporter();
    const html = buildDemoRequestHtml(body);
    const adminEmail = process.env.SMTP_USER || 'destek@sigortacuzdani.net';

    if (!smtp) {
      // Log mock email if SMTP not configured
      logger.info('[DEMO REQUEST MOCK] Would send email', 'DemoRequestAPI', {
        from: email,
        company,
        date,
        time,
      });

      return NextResponse.json({
        success: true,
        data: { message: 'Demo talebi alındı (test modu)' },
      });
    }

    // Send email to admin
    const info = await smtp.sendMail({
      from: `"Sigorta Cüzdanı Demo" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      replyTo: email,
      subject: `🎯 Yeni Demo Talebi - ${company}`,
      html,
    });

    logger.info(`Demo request email sent: ${info.messageId}`, 'DemoRequestAPI', {
      to: adminEmail,
      from: email,
      company,
      date,
      time,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Demo talebi başarıyla gönderildi',
        messageId: info.messageId
      },
    });

  } catch (error) {
    logger.error('Failed to send demo request email', 'DemoRequestAPI', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Demo talebi gönderilemedi. Lütfen daha sonra tekrar deneyin.'
        }
      },
      { status: 500 }
    );
  }
}
