import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase/adminApp';
import { logger } from '@/lib/logger';
import { PolicyType, POLICY_TYPE_LABELS } from '@/types/policy';
import { AppUser } from '@/types/user';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const adminDb = getFirestore(getAdminApp());

interface PolicySummary {
  id: string;
  policyNumber: string;
  policyType: PolicyType;
  insuranceCompany: string;
  endDate: string;
  daysUntilExpiry: number;
  premium: number;
}

interface WeeklyDigestData {
  expiringPolicies: PolicySummary[];
  newPolicies: PolicySummary[];
  totalActivePolicies: number;
  portfolioScore: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('SMTP credentials not configured — weekly digest emails will be logged only', 'WeeklyDigest');
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

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function calculatePortfolioScore(totalPolicies: number, expiringCount: number): string {
  if (totalPolicies === 0) return 'N/A';

  const expiryRatio = expiringCount / totalPolicies;

  if (expiryRatio === 0) return 'A';
  if (expiryRatio < 0.05) return 'B';
  if (expiryRatio < 0.10) return 'C';
  if (expiryRatio < 0.20) return 'D';
  return 'F';
}

function buildDigestHtml(data: WeeklyDigestData, companyName: string): string {
  const { expiringPolicies, newPolicies, totalActivePolicies, portfolioScore } = data;

  const expiringRows = expiringPolicies
    .map(
      (p) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${p.policyNumber}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${POLICY_TYPE_LABELS[p.policyType]}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${p.insuranceCompany}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: ${
            p.daysUntilExpiry <= 7 ? '#dc2626' : p.daysUntilExpiry <= 30 ? '#f59e0b' : '#10b981'
          };">${p.daysUntilExpiry} gün</td>
        </tr>
      `
    )
    .join('');

  const newPoliciesRows = newPolicies
    .map(
      (p) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${p.policyNumber}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${POLICY_TYPE_LABELS[p.policyType]}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${p.insuranceCompany}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
          }).format(p.premium)}</td>
        </tr>
      `
    )
    .join('');

  const scoreColor =
    portfolioScore === 'A' || portfolioScore === 'B'
      ? '#10b981'
      : portfolioScore === 'C'
      ? '#f59e0b'
      : '#dc2626';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #fff; margin: 0 0 8px; font-size: 24px;">Haftalık Portföy Özeti</h1>
    <p style="color: #94a3b8; margin: 0; font-size: 14px;">${companyName} • ${new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}</p>
  </div>

  <!-- Content -->
  <div style="background: #fff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">

    <!-- Summary Cards -->
    <div style="display: flex; gap: 16px; margin-bottom: 32px;">
      <div style="flex: 1; background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #1e293b;">${totalActivePolicies}</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Toplam Aktif Poliçe</div>
      </div>
      <div style="flex: 1; background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${expiringPolicies.length}</div>
        <div style="font-size: 13px; color: #92400e; margin-top: 4px;">Yaklaşan Yenileme</div>
      </div>
      <div style="flex: 1; background: #dcfce7; padding: 20px; border-radius: 8px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #10b981;">${newPolicies.length}</div>
        <div style="font-size: 13px; color: #065f46; margin-top: 4px;">Yeni Eklenen</div>
      </div>
      <div style="flex: 1; background: #e0e7ff; padding: 20px; border-radius: 8px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: ${scoreColor};">${portfolioScore}</div>
        <div style="font-size: 13px; color: #3730a3; margin-top: 4px;">Portföy Skoru</div>
      </div>
    </div>

    ${
      expiringPolicies.length > 0
        ? `
    <!-- Expiring Policies -->
    <div style="margin-bottom: 32px;">
      <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">⏰</span> Önümüzdeki 30 Günde Bitenler
      </h2>
      <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 2px solid #e2e8f0;">Poliçe No</th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 2px solid #e2e8f0;">Tür</th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 2px solid #e2e8f0;">Sigorta Şirketi</th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 2px solid #e2e8f0;">Kalan Süre</th>
          </tr>
        </thead>
        <tbody>
          ${expiringRows}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      newPolicies.length > 0
        ? `
    <!-- New Policies -->
    <div style="margin-bottom: 32px;">
      <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">✨</span> Son 7 Günde Eklenenler
      </h2>
      <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 2px solid #e2e8f0;">Poliçe No</th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 2px solid #e2e8f0;">Tür</th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 2px solid #e2e8f0;">Sigorta Şirketi</th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 2px solid #e2e8f0;">Prim</th>
          </tr>
        </thead>
        <tbody>
          ${newPoliciesRows}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      expiringPolicies.length === 0 && newPolicies.length === 0
        ? `
    <div style="text-align: center; padding: 40px 20px; background: #f8fafc; border-radius: 8px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <h3 style="color: #1e293b; margin: 0 0 8px;">Her Şey Yolunda!</h3>
      <p style="color: #64748b; margin: 0;">Bu hafta yenilenecek poliçe veya yeni ekleme yok.</p>
    </div>
    `
        : ''
    }

    <!-- CTA -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sigortacuzdani.net'}/dashboard"
         style="display: inline-block; background: #0f172a; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
        Dashboard'a Git
      </a>
    </div>

    <!-- Footer -->
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 20px;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
      Bu e-posta Sigorta Cüzdanı haftalık özet sistemi tarafından otomatik olarak gönderilmiştir.
      <br>
      Bildirimleri yönetmek için dashboard'daki ayarlar sayfasını ziyaret edin.
    </p>
  </div>
</body>
</html>`.trim();
}

async function fetchWeeklyDigestData(tenantId: string): Promise<WeeklyDigestData> {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch all active policies
  const allPoliciesSnapshot = await adminDb
    .collection('policies')
    .where('tenantId', '==', tenantId)
    .where('status', '==', 'active')
    .get();

  const totalActivePolicies = allPoliciesSnapshot.size;

  // Find expiring policies (next 30 days)
  const expiringPolicies: PolicySummary[] = [];
  const newPolicies: PolicySummary[] = [];

  for (const doc of allPoliciesSnapshot.docs) {
    const data = doc.data();
    const endDate = data.endDate;
    const createdAt = data.createdAt;

    // Check for expiring policies
    if (endDate) {
      const daysLeft = daysUntil(endDate);
      if (daysLeft > 0 && daysLeft <= 30) {
        expiringPolicies.push({
          id: doc.id,
          policyNumber: data.policyNumber || '',
          policyType: (data.policyType || 'diger') as PolicyType,
          insuranceCompany: data.insuranceCompany || '',
          endDate,
          daysUntilExpiry: daysLeft,
          premium: data.premium?.totalPremium || data.totalPremium || 0,
        });
      }
    }

    // Check for new policies (last 7 days)
    if (createdAt) {
      const createdDate = new Date(createdAt);
      if (createdDate >= sevenDaysAgo) {
        newPolicies.push({
          id: doc.id,
          policyNumber: data.policyNumber || '',
          policyType: (data.policyType || 'diger') as PolicyType,
          insuranceCompany: data.insuranceCompany || '',
          endDate: endDate || '',
          daysUntilExpiry: endDate ? daysUntil(endDate) : 0,
          premium: data.premium?.totalPremium || data.totalPremium || 0,
        });
      }
    }
  }

  // Sort expiring policies by days until expiry (ascending)
  expiringPolicies.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  // Sort new policies by creation date (descending, newest first)
  newPolicies.sort((a, b) => b.id.localeCompare(a.id));

  const portfolioScore = calculatePortfolioScore(totalActivePolicies, expiringPolicies.length);

  return {
    expiringPolicies,
    newPolicies,
    totalActivePolicies,
    portfolioScore,
  };
}

export async function sendWeeklyDigest(tenantId: string, companyId: string): Promise<number> {
  logger.info('Starting weekly digest for tenant', 'WeeklyDigest', { tenantId });

  const smtp = getTransporter();

  // Fetch users with email notifications enabled
  const usersSnapshot = await adminDb
    .collection('users')
    .where('tenantId', '==', tenantId)
    .where('emailNotifications', '==', true)
    .get();

  if (usersSnapshot.empty) {
    logger.info('No users with email notifications enabled', 'WeeklyDigest', { tenantId });
    return 0;
  }

  const users: AppUser[] = usersSnapshot.docs.map((doc) => doc.data() as AppUser);

  // Fetch tenant data for company name
  const tenantDoc = await adminDb.collection('tenants').doc(tenantId).get();
  const companyName = tenantDoc.data()?.companyName || companyId;

  // Fetch weekly digest data
  const digestData = await fetchWeeklyDigestData(tenantId);

  // If there's nothing to report and no activity, skip sending
  if (
    digestData.expiringPolicies.length === 0 &&
    digestData.newPolicies.length === 0 &&
    digestData.totalActivePolicies === 0
  ) {
    logger.info('No activity to report, skipping digest', 'WeeklyDigest', { tenantId });
    return 0;
  }

  const html = buildDigestHtml(digestData, companyName);
  const subject = `Haftalık Portföy Özeti - ${companyName}`;

  let emailsSent = 0;

  // Send to each user
  for (const user of users) {
    try {
      if (!smtp) {
        logger.info('[EMAIL MOCK] Would send weekly digest', 'WeeklyDigest', {
          to: user.email,
          tenantId,
          expiringCount: digestData.expiringPolicies.length,
          newCount: digestData.newPolicies.length,
        });
        emailsSent++;
        continue;
      }

      await smtp.sendMail({
        from: `"Sigorta Cüzdanı" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject,
        html,
      });

      logger.info(`Weekly digest sent to ${user.email}`, 'WeeklyDigest', {
        tenantId,
        userId: user.uid,
      });

      emailsSent++;
    } catch (error) {
      logger.error(`Failed to send weekly digest to ${user.email}`, 'WeeklyDigest', {
        error,
        tenantId,
        userId: user.uid,
      });
      // Continue with next user even if one fails
    }
  }

  logger.info(`Weekly digest complete for tenant: ${emailsSent} emails sent`, 'WeeklyDigest', {
    tenantId,
    emailsSent,
    expiringPolicies: digestData.expiringPolicies.length,
    newPolicies: digestData.newPolicies.length,
  });

  return emailsSent;
}
