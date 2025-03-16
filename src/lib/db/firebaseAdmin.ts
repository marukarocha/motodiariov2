// @/lib/db/firebaseAdmin.ts
import admin from "firebase-admin";

let serviceAccountStr = process.env.FIREBASE_ADMIN_SDK || "{}";

// Se a string estiver entre aspas simples ou duplas, remova-as.
if (
  (serviceAccountStr.startsWith('"') && serviceAccountStr.endsWith('"')) ||
  (serviceAccountStr.startsWith("'") && serviceAccountStr.endsWith("'"))
) {
  serviceAccountStr = serviceAccountStr.slice(1, -1);
}

const serviceAccount = JSON.parse(serviceAccountStr);

// Corrige as quebras de linha na private_key, se existir
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL, // Se necessário para Realtime DB
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { admin, adminAuth, adminDb };
