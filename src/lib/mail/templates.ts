/**
 * HTML Email templates for Sigorta Cüzdanı SaaS
 */

export function getVadeReminderTemplate({
  userName,
  policyType,
  company,
  daysLeft,
  endDate,
  dashboardUrl,
}: {
  userName: string;
  policyType: string;
  company: string;
  daysLeft: number;
  endDate: string;
  dashboardUrl: string;
}) {
  const isCritical = daysLeft <= 7;
  const accentColor = isCritical ? "#ef4444" : "#4f46e5";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid ${accentColor}; }
        .content { padding: 30px 0; }
        .policy-card { background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #f3f4f6; margin-bottom: 25px; }
        .days-badge { display: inline-block; padding: 4px 12px; border-radius: 100px; background-color: ${accentColor}; color: white; font-weight: 700; font-size: 14px; margin-bottom: 10px; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .btn { display: inline-block; padding: 12px 24px; background-color: ${accentColor}; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: ${accentColor}; margin:0;">Sigorta Cüzdanı</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Akıllı Poliçe Hatırlatıcı</p>
        </div>
        <div class="content">
          <p>Merhaba <strong>${userName}</strong>,</p>
          <p>Şirketinize ait bir sigorta poliçesinin vade bitimi yaklaşıyor. Riskiniz açıkta kalmaması için yenileme işlemlerini başlatmanızı öneririz.</p>
          
          <div class="policy-card">
            <div class="days-badge">${daysLeft} Gün Kaldı</div>
            <h2 style="margin: 0 0 10px 0; color: #111827;">${policyType} Poliçesi</h2>
            <p style="margin: 5px 0; font-size: 15px;"><strong>Şirket:</strong> ${company}</p>
            <p style="margin: 5px 0; font-size: 15px;"><strong>Vade Bitiş:</strong> ${endDate}</p>
          </div>

          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="btn">Dashboard'da İncele</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Sigorta Cüzdanı Pro. Tüm hakları saklıdır.</p>
          <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getGenericAlertTemplate({
  userName,
  title,
  message,
  actionUrl,
}: {
  userName: string;
  title: string;
  message: string;
  actionUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; }
        .header { background: #4f46e5; color: white; padding: 15px; text-align: center; border-radius: 4px; }
        .btn { display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Sigorta Cüzdanı Bildirimi</h2>
        </div>
        <p>Merhaba ${userName},</p>
        <h3>${title}</h3>
        <p>${message}</p>
        <div style="text-align: center;">
          <a href="${actionUrl}" class="btn">Sisteme Git</a>
        </div>
      </div>
    </body>
    </html>
  `;
}
