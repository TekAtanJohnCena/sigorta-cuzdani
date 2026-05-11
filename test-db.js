const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");

const env = fs.readFileSync(".env.local", "utf8");
const parsed = {};
env.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    parsed[match[1].trim()] = val;
  }
});

const credential = cert({
  projectId: parsed.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: parsed.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: parsed.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
});

initializeApp({ credential });

const db = getFirestore();

async function run() {
  const users = await db.collection("users").where("email", "==", "efsun@efsun.com").get();
  users.forEach(doc => console.log("User:", doc.id, doc.data()));

  const tenants = await db.collection("tenants").where("email", "==", "efsun@efsun.com").get();
  tenants.forEach(doc => console.log("Tenant:", doc.id, doc.data()));
  process.exit(0);
}

run().catch(console.error);
