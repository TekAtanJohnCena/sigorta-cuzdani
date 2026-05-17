import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase/adminApp";

// ──────────────────────────────────────────────
// Auth middleware — same pattern as tenants route
// ──────────────────────────────────────────────
function isAdminAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token") ||
    req.cookies.get("admin_token")?.value;
  if (!token) return false;

  // Use the same verification logic as admin/tenants
  try {
    const { verifyToken } = require("../auth/route");
    const result = verifyToken(token);
    return result.valid;
  } catch {
    return false;
  }
}

function requireAdmin(req: NextRequest): NextResponse | null {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Yetkisiz erişim.", timestamp: new Date().toISOString() },
      { status: 401 }
    );
  }
  return null;
}

interface TenantStats {
  tenantId: string;
  companyName: string;
  email: string;
  packageType: string;
  policyCount: number;
  userCount: number;
  lastLogin?: string;
}

interface AuditLogEntry {
  userId: string;
  tenantId: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// ──────────────────────────────────────────────
// GET — Comprehensive admin statistics
// ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const db = getFirestore(getAdminApp());

    // Fetch all tenants
    const tenantsSnapshot = await db.collection("tenants").get();
    const tenants = tenantsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Fetch all users
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map(d => d.data());

    // Fetch all policies
    const policiesSnapshot = await db.collection("policies").get();
    const policies = policiesSnapshot.docs.map(d => d.data());

    // Build tenant stats
    const tenantStats: TenantStats[] = tenants.map((tenant: Record<string, unknown>) => {
      const tenantId = tenant.uid as string || tenant.id as string;

      // Count users per tenant
      const tenantUsers = users.filter((u: Record<string, unknown>) => u.tenantId === tenantId);
      const userCount = tenantUsers.length;

      // Count policies per tenant
      const policyCount = policies.filter((p: Record<string, unknown>) => p.tenantId === tenantId).length;

      // Find last login (from users)
      const lastLoginDates = tenantUsers
        .map((u: Record<string, unknown>) => u.lastLogin as string | undefined)
        .filter(Boolean);
      const lastLogin = lastLoginDates.length > 0
        ? lastLoginDates.reduce((a, b) => (a && b && a > b ? a : b))
        : undefined;

      return {
        tenantId,
        companyName: tenant.companyName as string,
        email: tenant.email as string,
        packageType: tenant.packageType as string,
        policyCount,
        userCount,
        lastLogin,
      };
    });

    // Fetch recent audit logs (last 20)
    const auditLogsSnapshot = await db
      .collection("auditLogs")
      .orderBy("timestamp", "desc")
      .limit(20)
      .get();

    const recentActivity: AuditLogEntry[] = auditLogsSnapshot.docs.map(d => d.data() as AuditLogEntry);

    return NextResponse.json({
      success: true,
      data: {
        tenantStats,
        recentActivity,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[admin/stats] Error:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
