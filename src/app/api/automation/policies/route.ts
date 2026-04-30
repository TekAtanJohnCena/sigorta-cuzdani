import { NextResponse } from "next/server";
import { getAdminApp } from "@/lib/firebase/adminApp";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(request: Request) {
  // 1. Authorization Kontrolü
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || token !== cronSecret) {
    console.error("[CRON] Yetkisiz tetikleme denemesi engellendi.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);

    // 2. İş Mantığı: Bitiş tarihi geçmiş ve aktif olan poliçeleri bul
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Firestore sorgusu
    const policiesRef = db.collection("policies");
    const snapshot = await policiesRef
      .where("status", "==", "active")
      .where("endDate", "<", todayStr)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, updatedCount: 0, message: "Güncellenecek poliçe bulunamadı." });
    }

    // 3. Performans: Toplu güncelleme (Batch write)
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "expired",
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    console.info(`[CRON] ${snapshot.size} adet süresi dolmuş poliçe 'expired' olarak güncellendi.`);
    
    return NextResponse.json({
      success: true,
      updatedCount: snapshot.size,
      message: "İşlem başarıyla tamamlandı.",
    });

  } catch (error) {
    console.error("[CRON] Poliçe güncelleme otomasyonu sırasında hata oluştu:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
