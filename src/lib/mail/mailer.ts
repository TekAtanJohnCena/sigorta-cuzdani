import nodemailer from "nodemailer";

/**
 * Global Mailer Service for Sigorta Cüzdanı
 * Uses environment variables for configuration.
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  // If SMTP is not fully configured, log instead of failing in dev
  if (!process.env.SMTP_USER && !process.env.SMTP_PASS) {
    console.log("--- [MAIL MOCK] ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content (HTML): ${html.substring(0, 100)}...`);
    console.log("-------------------");
    return { mock: true, success: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Sigorta Cüzdanı" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || "Bu e-postayı görüntülemek için lütfen HTML destekleyen bir e-posta okuyucu kullanın.",
      html,
    });

    console.log(`[MAILER] Message sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[MAILER] Error sending email:", error);
    throw error;
  }
}
