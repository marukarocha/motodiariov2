import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/db/firebaseAdmin";

const catsBase = adminDb
  .collection("Admin")
  .doc("configs")
  .collection("maintenanceTypes");

// GET: lista todas as categorias ordenadas pelo campo `order`
export async function GET() {
  try {
    const snap = await catsBase.orderBy("order", "asc").get();
    const categories = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(categories);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao listar categorias." }, { status: 500 });
  }
}

// POST: cria nova categoria, atribuindo `order = totalCategorias + 1`
export async function POST(req: NextRequest) {
  try {
    const { category, color } = await req.json();
    if (!category || !color) {
      return NextResponse.json(
        { error: "Categoria e cor são obrigatórias." },
        { status: 400 }
      );
    }
    // conta quantas já existem
    const snap = await catsBase.get();
    const nextOrder = snap.size + 1;

    // id do doc será slug de `category` em lowercase sem espaços
    const id = category.trim().toLowerCase().replace(/\s+/g, "-");

    await catsBase.doc(id).set({
      category,
      color,
      items: [],
      order: nextOrder,
    });

    return NextResponse.json({ message: "Categoria criada." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno ao criar categoria." },
      { status: 500 }
    );
  }
}

// DELETE: apaga uma categoria por ID
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }
    await catsBase.doc(id).delete();
    return NextResponse.json({ message: "Categoria removida." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao remover categoria." },
      { status: 500 }
    );
  }
}
