import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { verifyToken } from "../auth/route";

// ──────────────────────────────────────────────
// Firebase Admin SDK — server-side only
// ──────────────────────────────────────────────
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

function getAdminDb() {
  return getFirestore(getAdminApp());
}

// ──────────────────────────────────────────────
// Auth middleware — verifyToken ile HMAC doğrulama
// (Artık base64url decode ve HMAC kontrolü düzgün çalışır)
// ──────────────────────────────────────────────
function isAdminAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token") ||
    req.cookies.get("admin_token")?.value;
  if (!token) return false;
  const result = verifyToken(token);
  return result.valid;
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

function hasAdminCreds(): boolean {
  return !!(process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY);
}

// ──────────────────────────────────────────────
// GET — Tenant listesi
// ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!hasAdminCreds()) {
    return NextResponse.json(
      { success: false, error: "Firebase Admin SDK credentials eksik. .env.local dosyasını kontrol edin.", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }

  try {
    const db = getAdminDb();
    const snapshot = await db.collection("tenants").orderBy("createdAt", "desc").get();
    const tenants = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({
      success: true,
      data: tenants,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// POST — Yeni tenant & Firebase Auth user oluştur
// ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!hasAdminCreds()) {
    return NextResponse.json(
      { success: false, error: "Firebase Admin SDK credentials eksik.", manualSetupRequired: true, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { email, password, companyName, packageType, durationDays, notes } = body;

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { success: false, error: "email, password ve companyName zorunludur.", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const adminApp = getAdminApp();
    const adminAuth = getAuth(adminApp);
    const db = getAdminDb();

    // Firebase Auth user oluştur (server-side — session bozulmaz)
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: companyName,
    });

    const uid = userRecord.uid;

    // Users collection
    await db.collection("users").doc(uid).set({
      uid,
      email,
      name: companyName,
      role: "admin",
      tenantId: uid,
      createdAt: new Date().toISOString(),
    });

    // Tenant kaydı
    const startDate = new Date();
    const endDate = new Date();
    const days = parseInt(durationDays) || 7;
    endDate.setDate(endDate.getDate() + days);

    const tenantRef = await db.collection("tenants").add({
      companyName,
      email,
      packageType: packageType || "demo",
      durationDays: days,
      notes: notes || "",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: true,
      uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { uid, tenantId: tenantRef.id },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    const status = msg.includes("already-exists") ? 409 : 400;
    return NextResponse.json(
      { success: false, error: msg, timestamp: new Date().toISOString() },
      { status }
    );
  }
}

// ──────────────────────────────────────────────
// PUT — Tenant süresini uzat (endDate güncelle)
// ──────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!hasAdminCreds()) {
    return NextResponse.json(
      { success: false, error: "Firebase Admin SDK credentials eksik.", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { tenantId, durationDays } = body;

    if (!tenantId || !durationDays) {
      return NextResponse.json(
        { success: false, error: "tenantId ve durationDays zorunludur.", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + parseInt(durationDays));

    await db.collection("tenants").doc(tenantId).update({
      endDate: newEnd.toISOString(),
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { tenantId, newEndDate: newEnd.toISOString() },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// DELETE — Tenant sil
// ──────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!hasAdminCreds()) {
    return NextResponse.json(
      { success: false, error: "Firebase Admin SDK credentials eksik.", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId query parametresi zorunludur.", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    await db.collection("tenants").doc(tenantId).delete();

    return NextResponse.json({
      success: true,
      data: { tenantId },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
