import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp = getApps().length > 0 ? getApps()[0] : null;

if (!adminApp) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
  if (Object.keys(serviceAccount).length > 0) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  }
}

export const db = adminApp ? getFirestore(adminApp) : null;
