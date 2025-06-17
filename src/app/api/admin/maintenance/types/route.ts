import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/db/firebaseAdmin";

const catsBase = adminDb
  .collection("Admin")
  .doc("configs")
  .collection("maintenanceTypes");

// GET: lista todos os tipos (items) agrupados por categoria
export async function GET() {
  try {
    const snap = await catsBase.get();
    const types = snap.docs.flatMap(doc => {
      const data = doc.data();
      const categoryId = doc.id;
      const categoryLabel = data.category;
      const color = data.color;
      const items = Array.isArray(data.items) ? data.items : [];

      return items.map((item: any, index: number) => {
        const order = `${data.order || index + 1}.${item.order || index + 1}`;
        return {
          id: item.id,
          label: item.label,
          description: item.description,
          icon: item.icon,
          position: item.position,
          categoryId,
          categoryLabel,
          color,
          order
        };
      });
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error("Erro ao listar tipos:", error);
    return NextResponse.json({ error: "Erro ao listar tipos." }, { status: 500 });
  }
}

// POST: adiciona novo tipo dentro de uma categoria
export async function POST(req: NextRequest) {
  try {
    const { categoryId, label, description, icon, position } = await req.json();

    if (!categoryId || !label || !description || !icon || !position?.top || !position?.left) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const docRef = catsBase.doc(categoryId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
    }

    const data = docSnap.data() || {};
    const items = Array.isArray(data.items) ? data.items : [];

    const id = label.trim().toLowerCase().replace(/\s+/g, "-");

    if (items.find((it: any) => it.id === id)) {
      return NextResponse.json({ error: "Tipo já existente." }, { status: 400 });
    }

    const parentOrder = data.order || "0";
    const newOrder = `${parentOrder}.${items.length + 1}`;

    const newItem = {
      id,
      label,
      description,
      icon,
      position,
      order: newOrder
    };

    await docRef.update({
      items: [...items, newItem]
    });

    return NextResponse.json({ message: "Tipo criado com sucesso.", item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tipo:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// DELETE: remove tipo por ID (procurando em todas as categorias)
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID do tipo é obrigatório." }, { status: 400 });
    }

    const snap = await catsBase.get();
    for (const doc of snap.docs) {
      const data = doc.data();
      const items = Array.isArray(data.items) ? data.items : [];
      if (items.some((it: any) => it.id === id)) {
        const updated = items.filter((it: any) => it.id !== id);
        await catsBase.doc(doc.id).update({ items: updated });
        return NextResponse.json({ message: "Tipo removido com sucesso." });
      }
    }

    return NextResponse.json({ error: "Tipo não encontrado." }, { status: 404 });
  } catch (error) {
    console.error("Erro ao remover tipo:", error);
    return NextResponse.json({ error: "Erro interno ao remover tipo." }, { status: 500 });
  }
}
