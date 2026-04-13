import { NextResponse } from "next/server";
import { getAllPolicies, getUsersByTenant } from "@/lib/firebase/firestore";
import { daysUntil, formatDateShort } from "@/lib/utils/date";
import { sendEmail } from "@/lib/mail/mailer";
import { getVadeReminderTemplate } from "@/lib/mail/templates";
import { POLICY_TYPE_LABELS } from "@/types/policy";
import { AppUser } from "@/types/user";

/**
 * DAILY REMINDER AUTOMATION
 * This route should be triggered daily via a Cron Job (e.g. Vercel Cron)
 * Trigger URL: /api/automation/reminders
 */

export async function GET() {
  console.log("[AUTOMATION] Starting daily policy reminders task...");
  
  try {
    // 1. Fetch all active policies
    const policies = await getAllPolicies();
    const activePolicies = policies.filter(p => p.status === "active");
    
    let sentCount = 0;
    
    // 2. Scan policies for deadlines
    for (const policy of activePolicies) {
      const daysLeft = daysUntil(policy.endDate);
      
      // We send reminders at 30, 15, and 7 days marks
      if ([30, 15, 7].includes(daysLeft)) {
        console.log(`[AUTOMATION] Policy ${policy.policyNumber} is expiring in ${daysLeft} days. Triggering emails...`);
        
        // 3. Find target users (employees of this tenant)
        const tenantUsers = await getUsersByTenant(policy.tenantId) as AppUser[];
        const targetUsers = tenantUsers.filter(u => u.emailNotifications !== false); // Default to true if undefined
        
        for (const user of targetUsers) {
          try {
             const html = getVadeReminderTemplate({
               userName: user.name,
               policyType: POLICY_TYPE_LABELS[policy.policyType as keyof typeof POLICY_TYPE_LABELS] || policy.policyType,
               company: policy.insuranceCompany,
               daysLeft,
               endDate: formatDateShort(policy.endDate),
               dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/policies/${policy.id}`
             });

             await sendEmail({
               to: user.email,
               subject: `🚨 Poliçe Vade Hatırlatması: ${daysLeft} Gün Kaldı! (${policy.insuranceCompany})`,
               html
             });
             
             sentCount++;
          } catch (mailErr) {
            console.error(`[AUTOMATION] Failed to send email to ${user.email}`, mailErr);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${sentCount} adet hatırlatma e-postası kuyruğa alındı.`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("[AUTOMATION] Fatal error in reminders task:", error);
    return NextResponse.json({ error: "Otomasyon işlemi sırasında hata oluştu.", details: error.message }, { status: 500 });
  }
}
