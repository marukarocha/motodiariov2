// app/api/admin/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK || "{}");

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;
  const { role } = await req.json();

  if (!userId || !role) {
    return NextResponse.json({ error: "ID e role são obrigatórios" }, { status: 400 });
  }

  try {
    await admin.firestore().collection("users").doc(userId).update({ role });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
