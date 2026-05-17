import { NextRequest, NextResponse } from "next/server";
import { getAdminApp } from "@/lib/firebase/adminApp";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, idToken, name, role, tenantId } = body;

    if (!email || !idToken) {
      return NextResponse.json({ error: "Email ve token gerekli" }, { status: 400 });
    }

    const adminApp = getAdminApp();
    const auth = getAdminAuth(adminApp);

    const decoded = await auth.verifyIdToken(idToken);
    if (!decoded.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRecord = await auth.getUserByEmail(email);

    // Create/update user doc in Firestore (Admin SDK bypasses rules)
    if (name && tenantId) {
      const db = getFirestore(adminApp);
      await db.collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userRecord.email || email,
        name,
        role: role || "user",
        tenantId,
        createdAt: new Date().toISOString(),
        emailNotifications: true,
      });
    }

    return NextResponse.json({
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (err: unknown) {
    const code = err && typeof err === "object" && "code" in err ? err.code : "";
    if (code === "auth/user-not-found") {
      return NextResponse.json({ error: "not-found" }, { status: 404 });
    }
    if (code === "auth/id-token-expired" || code === "auth/argument-error") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[users/lookup] Error:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
