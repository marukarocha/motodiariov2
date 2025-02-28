// app/api/admin/platforms/route.ts
import { NextResponse } from "next/server";
import { admin, adminDb as db } from "@/lib/db/firebaseAdmin";

// POST - Criar nova plataforma
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }
    
    const docRef = await db
      .collection("Admin")
      .doc("configs")
      .collection("tripsPlatforms")
      .add({
        name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        associatedRaceTypes: [] // inicia sem associação
      });
    
    return NextResponse.json(
      { message: "Plataforma adicionada com sucesso", id: docRef.id },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Listar todas as plataformas
export async function GET(request: Request) {
  try {
    const snapshot = await db
      .collection("Admin")
      .doc("configs")
      .collection("tripsPlatforms")
      .get();
    const platforms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(platforms, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remover uma plataforma
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
      .collection("tripsPlatforms")
      .doc(id)
      .delete();
    return NextResponse.json({ message: "Plataforma removida com sucesso" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Atualizar plataforma (por exemplo, associar raceTypes)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, associatedRaceTypes } = body; // associatedRaceTypes: array de IDs

    if (!id) {
      return NextResponse.json({ error: "ID da plataforma não informado" }, { status: 400 });
    }

    await db
      .collection("Admin")
      .doc("configs")
      .collection("tripsPlatforms")
      .doc(id)
      .update({ associatedRaceTypes });
    return NextResponse.json({ message: "Plataforma atualizada com sucesso" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
