import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getAllPolicies, getUsersByTenant } from "@/lib/firebase/firestore";
import { daysUntil, formatDateShort } from "@/lib/utils/date";
import { sendEmail } from "@/lib/mail/mailer";
import { getVadeReminderTemplate } from "@/lib/mail/templates";
import { POLICY_TYPE_LABELS } from "@/types/policy";
import { AppUser } from "@/types/user";
import { logger } from "@/lib/logger";

/**
 * DAILY REMINDER AUTOMATION
 * Vercel Cron veya harici cron ile tetiklenir.
 * Koruma: CRON_SECRET header doğrulaması — korumasız erişim engellendi.
 *
 * Vercel cron.json örneği:
 * { "crons": [{ "path": "/api/automation/reminders", "schedule": "0 8 * * *" }] }
 */

function verifyCronSecret(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Secret ayarlanmamışsa prod'da engelle
    if (process.env.NODE_ENV === "production") {
      logger.warn("CRON_SECRET not configured in production", "automation/reminders");
      return false;
    }
    // Dev'de geç
    return true;
  }

  if (!authHeader?.startsWith("Bearer ")) return false;
  const provided = authHeader.slice(7);

  // Timing-safe karşılaştırma
  try {
    const providedBuf = Buffer.from(provided);
    const secretBuf = Buffer.from(cronSecret);
    if (providedBuf.length !== secretBuf.length) return false;
    return timingSafeEqual(providedBuf, secretBuf);
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  // ─── Güvenlik Kontrolü ─────────────────────────────────
  const authHeader = req.headers instanceof Headers ? req.headers.get("authorization") : null;
  if (!verifyCronSecret(authHeader)) {
    logger.warn("Unauthorized cron access attempt", "automation/reminders");
    return NextResponse.json(
      { error: "Yetkisiz erişim." },
      { status: 401 }
    );
  }

  logger.info("Daily reminder task started", "automation/reminders");

  try {
    const policies = await getAllPolicies() as Array<Record<string, unknown>>;
    const activePolicies = policies.filter((p) => p.status === "active");

    let sentCount = 0;
    let skippedCount = 0;

    for (const policy of activePolicies) {
      const daysLeft = daysUntil(policy.endDate as string);

      if ([30, 15, 7].includes(daysLeft)) {
        logger.info("Policy reminder triggered", "automation/reminders", {
          policyNumber: policy.policyNumber as string,
          daysLeft,
        });

        const tenantUsers = await getUsersByTenant(policy.tenantId as string) as AppUser[];
        const targetUsers = tenantUsers.filter((u) => u.emailNotifications !== false);

        for (const user of targetUsers) {
          try {
            const html = getVadeReminderTemplate({
              userName: user.name,
              policyType:
                POLICY_TYPE_LABELS[policy.policyType as keyof typeof POLICY_TYPE_LABELS] ||
                (policy.policyType as string),
              company: policy.insuranceCompany as string,
              daysLeft,
              endDate: formatDateShort(policy.endDate as string),
              dashboardUrl: `${
                process.env.NEXT_PUBLIC_APP_URL || "https://app.sigortacuzdani.com"
              }/dashboard/policies/${policy.id as string}`,
            });

            await sendEmail({
              to: user.email,
              subject: `🚨 Poliçe Vade Hatırlatması: ${daysLeft} Gün Kaldı! (${policy.insuranceCompany})`,
              html,
            });

            sentCount++;
          } catch (mailErr) {
            logger.error("Email send failed", "automation/reminders", {
              email: user.email,
              error: (mailErr as Error).message,
            });
            skippedCount++;
          }
        }
      }
    }

    logger.info("Reminder task completed", "automation/reminders", {
      sent: sentCount,
      skipped: skippedCount,
      totalPolicies: activePolicies.length,
    });

    return NextResponse.json({
      success: true,
      message: `${sentCount} adet hatırlatma e-postası gönderildi.`,
      skipped: skippedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Reminder task fatal error", "automation/reminders", {
      error: (error as Error).message,
    });
    return NextResponse.json(
      { error: "Otomasyon işlemi başarısız oldu." },
      { status: 500 }
    );
  }
}
