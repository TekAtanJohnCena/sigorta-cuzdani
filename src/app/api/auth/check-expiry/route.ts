import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase/adminApp";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, expired: true, error: "No token" }, { status: 401 });
    }

    const app = getAdminApp();
    const adminAuth = getAuth(app);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const db = getFirestore(app);

    // 1. Check if they have a tenant record where uid == their uid
    const snapshot = await db.collection("tenants").where("uid", "==", uid).get();
    
    // If no tenant record is found by UID, check if there is one where email matches (legacy fallback)
    let tenantDoc = null;
    if (!snapshot.empty) {
      tenantDoc = snapshot.docs[0].data();
    } else {
      const emailSnapshot = await db.collection("tenants").where("email", "==", decodedToken.email).get();
      if (!emailSnapshot.empty) {
        tenantDoc = emailSnapshot.docs[0].data();
      }
    }

    // No record = old/admin user, allow access
    if (!tenantDoc) {
      return NextResponse.json({ success: true, expired: false });
    }

    if (!tenantDoc.endDate) {
      return NextResponse.json({ success: true, expired: false });
    }

    const endDate = new Date(tenantDoc.endDate);
    const now = new Date();
    const expired = now > endDate;

    return NextResponse.json({ success: true, expired, endDate: tenantDoc.endDate });
  } catch (error) {
    console.error("[check-expiry API] Error:", error);
    // Fail-Closed: return expired true on any error
    return NextResponse.json({ success: false, expired: true, error: "Verification failed" }, { status: 500 });
  }
}
