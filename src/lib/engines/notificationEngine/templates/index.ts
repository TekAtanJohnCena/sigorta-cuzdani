import { POLICY_TYPE_LABELS } from '@/types/policy';

export function getExpiryWarningTemplate(payload: Record<string, unknown>): {
  title: string;
  body: string;
  actionUrl?: string;
} {
  const days = payload.daysUntilExpiry as number;
  const policyNumber = payload.policyNumber as string || '';
  const policyType = payload.policyType as string || '';
  const company = payload.insuranceCompany as string || '';
  const typeLabel = POLICY_TYPE_LABELS[policyType as keyof typeof POLICY_TYPE_LABELS] || policyType;

  if (days <= 1) {
    return {
      title: `ACIL: ${typeLabel} policeniz yarin sona eriyor`,
      body: `${company} - ${policyNumber} numarali ${typeLabel} policenizin vadesi yarin doluyor. Yenileme islemi yapilmazsa teminatsiz kalacaksiniz.`,
      actionUrl: '/dashboard/renewals',
    };
  }

  if (days <= 7) {
    return {
      title: `${typeLabel} policeniz ${days} gun icinde sona erecek`,
      body: `${company} - ${policyNumber} numarali policenizin bitis tarihine ${days} gun kaldi. Yenileme surecini baslatmanizi oneriyoruz.`,
      actionUrl: '/dashboard/renewals',
    };
  }

  if (days <= 30) {
    return {
      title: `Police vade uyarisi: ${days} gun`,
      body: `${company} - ${policyNumber} (${typeLabel}) policenizin vadesine ${days} gun kaldi. Teklif almak icin simdi harekete gecebilirsiniz.`,
      actionUrl: '/dashboard/renewals',
    };
  }

  return {
    title: `Police vade bilgilendirmesi`,
    body: `${company} - ${policyNumber} (${typeLabel}) policenizin vadesine ${days} gun kaldi.`,
    actionUrl: '/dashboard/renewals',
  };
}

export function getClaimUpdateTemplate(payload: Record<string, unknown>): {
  title: string;
  body: string;
  actionUrl?: string;
} {
  const claimId = payload.claimId as string || '';
  const newStatus = payload.newStatus as string || '';
  const policyNumber = payload.policyNumber as string || '';

  const statusMessages: Record<string, string> = {
    expert_assigned: 'Hasar dosyaniza eksper atandi.',
    under_review: 'Hasar dosyaniz incelemeye alindi.',
    approved: 'Hasar talebiniz onaylandi.',
    paid: 'Hasar odemeniz gerceklestirildi.',
    rejected: 'Hasar talebiniz reddedildi.',
  };

  const message = statusMessages[newStatus] || `Hasar durumunuz guncellendi: ${newStatus}`;

  return {
    title: `Hasar Guncelleme: ${policyNumber}`,
    body: message,
    actionUrl: `/dashboard/claims`,
  };
}

export function getRiskAlertTemplate(payload: Record<string, unknown>): {
  title: string;
  body: string;
  actionUrl?: string;
} {
  const severity = payload.severity as string || 'medium';
  const description = payload.description as string || 'Portfolyonuzde yeni bir risk tespit edildi.';

  const prefix = severity === 'critical' ? 'KRITIK RISK' : 'Risk Uyarisi';

  return {
    title: prefix,
    body: description,
    actionUrl: '/dashboard/risk-gaps',
  };
}
