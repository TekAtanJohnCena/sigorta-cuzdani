import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase/adminApp";

interface AuditEntry {
  userId: string;
  tenantId: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ip?: string;
  timestamp: string;
}

export async function logAudit(entry: Omit<AuditEntry, "timestamp">) {
  try {
    const db = getFirestore(getAdminApp());
    await db.collection("auditLogs").add({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[audit] Failed to log:", err);
  }
}
