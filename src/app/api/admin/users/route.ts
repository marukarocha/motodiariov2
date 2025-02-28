// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK || "{}")),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export async function GET() {
  try {
    const usersSnapshot = await admin.firestore().collection("users").get();

    const users: any[] = [];

    // Para cada doc em /users, buscamos os subdocumentos em /users/{userId}/configurations
    for (const docSnap of usersSnapshot.docs) {
      const userId = docSnap.id;
      const userDocData = docSnap.data(); // Dados do doc principal (se houver)

      // 1) Buscar dados do subdoc "user"
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

      // 2) Buscar dados do subdoc "bike"
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

      // Montar objeto final
      users.push({
        id: userId,
        // Dados do doc principal (se existir)
        ...userDocData,
        // Dados do subdocumento user
        ...userConfigData,
        // Dados do subdocumento bike, agrupados em um campo "bike"
        bike: bikeConfigData,
      });
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
