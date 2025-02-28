// @/lib/db/firebaseAdmin.ts
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK || "{}");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL, // Se necessário para Realtime DB
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

// Exporta também o objeto "admin" para acessar propriedades estáticas, como FieldValue.
export { admin, adminAuth, adminDb };
