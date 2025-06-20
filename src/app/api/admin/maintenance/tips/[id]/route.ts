import { NextResponse } from "next/server";
import { adminDb } from "@/lib/db/firebaseAdmin";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await adminDb.collection("Admin/configs/maintenanceTipsManual").doc(params.id).delete();
    return NextResponse.json({ message: "Dica excluída com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir dica", details: `${error}` }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await adminDb.collection("Admin/configs/maintenanceTipsManual").doc(params.id).update(body);
    return NextResponse.json({ message: "Dica atualizada com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar dica", details: `${error}` }, { status: 500 });
  }
}
