// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK || "{}");

// Corrige as quebras de linha na chave privada
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export async function GET() {
  try {
    const usersSnapshot = await admin.firestore().collection("users").get();

    const users: any[] = [];

    for (const docSnap of usersSnapshot.docs) {
      const userId = docSnap.id;
      const userDocData = docSnap.data();

      const userConfigRef = admin
        .firestore()
        .collection("users")
        .doc(userId)
        .collection("configurations")
        .doc("user");

      const userConfigSnap = await userConfigRef.get();
      let userConfigData = {};
      if (userConfigSnap.exists) {
        userConfigData = userConfigSnap.data() || {};
      }

      const bikeConfigRef = admin
        .firestore()
        .collection("users")
        .doc(userId)
        .collection("configurations")
        .doc("bike");

      const bikeConfigSnap = await bikeConfigRef.get();
      let bikeConfigData = {};
      if (bikeConfigSnap.exists) {
        bikeConfigData = bikeConfigSnap.data() || {};
      }

      users.push({
        id: userId,
        ...userDocData,
        ...userConfigData,
        bike: bikeConfigData,
      });
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
