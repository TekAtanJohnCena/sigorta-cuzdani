import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (server-side only)
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Simple admin auth check
function isAdminAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-token");
  if (!auth) return false;
  try {
    const decoded = Buffer.from(auth, "base64").toString("utf-8");
    const [username] = decoded.split(":");
    return username === process.env.ADMIN_USERNAME;
  } catch {
    return false;
  }
}

// GET — List all tenants from Firestore (client SDK via service account not available without admin SDK)
// For MVP, we use client-side fetch from /emre page directly via Firebase client SDK
// This route handles Firebase Auth user creation (server-side only operation)
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // Check if Firebase Admin credentials are available
    const hasAdminCreds = process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (action === "create_user" && hasAdminCreds) {
      const adminApp = getAdminApp();
      const adminAuth = getAuth(adminApp);
      
      const { email, password, companyName } = body;
      
      try {
        const userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: companyName,
        });
        
        // Create user doc in Firestore via Admin SDK
        const db = getAdminApp() ? getFirestore(getAdminApp()) : null;
        if (db) {
          await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name: companyName,
            role: "admin",
            tenantId: userRecord.uid,
            createdAt: new Date().toISOString(),
          });
        }
        
        return NextResponse.json({ success: true, uid: userRecord.uid });
      } catch (authError: any) {
        return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
      }
    }

    // Fallback: return instructions for manual Firebase Auth setup
    return NextResponse.json({
      success: false,
      error: "Firebase Admin SDK credentials not configured. Please create user manually in Firebase Console and then add tenant record.",
      manualSetupRequired: true,
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
