import { PolicyType } from './policy';

// ============================================
// Notification Types — B2B Bildirim Veri Modeli
// ============================================

export type NotificationChannel = 'in_app' | 'email' | 'sms';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export type NotificationCategory =
  | 'policy_expiry'       // Police vade uyarisi
  | 'payment_reminder'    // Odeme hatirlatma
  | 'claim_update'        // Hasar durum degisikligi
  | 'risk_alert'          // Risk uyarisi
  | 'renewal_action'      // Yenileme aksiyonu
  | 'system';             // Sistem bildirimi

export type NotificationStatus = 'pending' | 'sent' | 'read' | 'failed';

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface Notification {
  id: string;
  tenantId: string;
  companyId: string;

  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;

  title: string;
  body: string;
  actionUrl?: string;

  recipient: NotificationRecipient;
  departmentId?: string;

  metadata?: {
    policyId?: string;
    policyType?: PolicyType;
    claimId?: string;
    daysUntilExpiry?: number;
    amount?: number;
  };

  sentAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  tenantId: string;
  companyId: string;
  userId: string;

  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;

  expiryWarningDays: number[];  // ornegin [60, 30, 15, 7, 1]
  quietHoursStart?: string;     // "22:00"
  quietHoursEnd?: string;       // "08:00"

  disabledCategories: NotificationCategory[];
}

export interface ExpiryCheckResult {
  policyId: string;
  policyNumber: string;
  policyType: PolicyType;
  insuranceCompany: string;
  endDate: string;
  daysUntilExpiry: number;
  premium: number;
  warningLevel: 'critical' | 'urgent' | 'warning' | 'info';
}
