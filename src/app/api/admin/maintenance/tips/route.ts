import { NextResponse } from "next/server";
import { adminDb } from "@/lib/db/firebaseAdmin";

const tipsRef = adminDb.collection("Admin/configs/maintenanceTipsManual");

export async function GET() {
  const snapshot = await tipsRef.get();
  const tips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(tips);
}

export async function POST(req: Request) {
  try {
    const { title, message, icon = "", categoryId, order = 0, visible = true } = await req.json();

    if (!title || !message || !categoryId) {
      return NextResponse.json({ error: "Campos obrigatórios: title, message, categoryId" }, { status: 400 });
    }

    const docRef = await tipsRef.add({ title, message, icon, categoryId, order, visible });
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar dica", details: `${error}` }, { status: 500 });
  }
}
