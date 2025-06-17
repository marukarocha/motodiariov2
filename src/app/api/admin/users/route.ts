// app/api/admin/users/route.ts

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/db/firebaseAdmin"; // assume que já tem o Firestore inicializado

export async function GET() {
  try {
    const usersSnapshot = await adminDb.collection("users").get();
    const users: any[] = [];

    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();

      // Tenta buscar as configurações do usuário
      let configData: any = {};
      try {
        const configSnap = await adminDb
          .collection("users")
          .doc(userId)
          .collection("configurations")
          .doc("user")
          .get();
        configData = configSnap.exists ? configSnap.data() : {};
      } catch (e) {
        console.warn(`Usuário ${userId} sem configurações.`);
      }

      users.push({
        id: userId,
        ...configData,
        ...userData, // sobrepõe config caso existam duplicações
      });
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
