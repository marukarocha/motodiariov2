// app/api/admin/raceTypes/route.ts
import { NextResponse } from "next/server";
import { admin, adminDb as db } from "@/lib/db/firebaseAdmin";

// POST - Criar novo tipo de corrida
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;
    
    if (!type) {
      return NextResponse.json({ error: "Tipo é obrigatório" }, { status: 400 });
    }
    
    const docRef = await db
      .collection("Admin")
      .doc("configs")
      .collection("tripsRaceTypes")
      .add({
        type,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return NextResponse.json(
      { message: "Tipo de corrida adicionado com sucesso", id: docRef.id },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Listar todos os tipos de corrida
export async function GET(request: Request) {
  try {
    const snapshot = await db
      .collection("Admin")
      .doc("configs")
      .collection("tripsRaceTypes")
      .get();
    const raceTypes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(raceTypes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remover um tipo de corrida
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID não informado" }, { status: 400 });
    }

    await db
      .collection("Admin")
      .doc("configs")
      .collection("tripsRaceTypes")
      .doc(id)
      .delete();
    return NextResponse.json({ message: "Tipo de corrida removido com sucesso" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
