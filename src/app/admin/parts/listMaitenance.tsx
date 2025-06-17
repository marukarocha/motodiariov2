"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PinPosition from "../components/pinPosition";


interface Category {
  id: string;
  category: string;
  color: string;
  order: number;
}

interface Type {
  id: string;
  label: string;
  number: string;      // ← novo
  categoryId: string;
  description: string;
  icon: string;
  position: { top: string; left: string };
}

export default function ListMaintenanceAdmin() {
  const { toast } = useToast();

  /* ---------------------------- estados gerais ---------------------------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<{ top: string; left: string } | null>(null);


  /* ------------------------ estados – categoria nova ----------------------- */
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("bg-blue-500");

  /* ------------------------- estados – tipo novo -------------------------- */
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [typeLabel, setTypeLabel] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [typeIcon,    setTypeIcon]    = useState("");
  const [posTop,      setPosTop]      = useState("");
  const [posLeft,     setPosLeft]     = useState("");

  /* ------------------------------ effects --------------------------------- */
  useEffect(() => { loadAll(); }, []);
  async function loadAll() { await fetchCategories(); await fetchTypes(); }

  async function fetchCategories() {
    const res  = await fetch("/api/admin/maintenance/categories");
    if (!res.ok) return;
    setCategories(await res.json());
  }
  async function fetchTypes() {
    const res  = await fetch("/api/admin/maintenance/types");
    if (!res.ok) return;
    setTypes(await res.json());
  }

  /* --------------------------- criar categoria --------------------------- */
  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const r = await fetch("/api/admin/maintenance/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: categoryName, color: categoryColor })
    });
    r.ok ? toast({ title: "Categoria criada", variant: "success" })
        : toast({ title: (await r.json()).error, variant: "destructive" });
    setLoading(false); setCategoryName(""); await fetchCategories();
  }

  /* ----------------------------- criar tipo ------------------------------ */
  async function handleCreateType(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory) return;
    setLoading(true);
    const body = {
      label:       typeLabel,
      description: typeDescription,
      icon:        typeIcon,
      categoryId:  selectedCategory.id,
      position:    { top: posTop, left: posLeft }
    };
    const r = await fetch("/api/admin/maintenance/types",{
      method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body)
    });
    r.ok ? toast({ title:"Tipo criado",variant:"success"})
        : toast({ title:(await r.json()).error,variant:"destructive"});
    setLoading(false);
    setTypeLabel(""); setTypeDescription(""); setTypeIcon(""); setPosTop(""); setPosLeft("");
    await fetchTypes();
  }

  /* ---------------------------- deletar itens ---------------------------- */
  async function handleDeleteCategory(id:string){/*...igual de antes...*/}
  async function handleDeleteType(id:string){/*...igual de antes...*/}

  /* ------------------------------ JSX ------------------------------------ */
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-extrabold text-center">Administração de Manutenções</h1>
      <PinPosition
          onSelectPosition={(pos) => {
            setPosition(pos);
            setPosTop(pos.top);
            setPosLeft(pos.left);
          }}
        />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ---------------------- CATEGORIAS ---------------------- */}
        <Card>
          <CardHeader><CardTitle>Categorias</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* form nova categoria */}
            <form onSubmit={handleCreateCategory} className="space-y-2">
              <Input placeholder="Nome da categoria" value={categoryName}
                     onChange={e=>setCategoryName(e.target.value)} required />
              <Input placeholder="Classe de cor Tailwind" value={categoryColor}
                     onChange={e=>setCategoryColor(e.target.value)} required />
              <Button className="w-full" disabled={loading}>Criar Categoria</Button>
            </form>

            {/* lista */}
            {categories.map(c=>(
              <div key={c.id} className="flex justify-between p-2 border rounded">
                <span className={`font-semibold ${c.color}`}>{c.category}</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={()=>setSelectedCategory(c)}>Gerenciar</Button>
                  <Button size="sm" variant="destructive"
                          onClick={()=>handleDeleteCategory(c.id)}>Excluir</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ------------------------ TIPOS ------------------------- */}
        <Card>
          <CardHeader><CardTitle>Tipos
              {selectedCategory && (
                  <span
                    className={`ml-2 font-semibold ${selectedCategory.color} px-2 py-0.5 rounded`}
                  >
                    {selectedCategory.category}
                  </span>
                )}
            </CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!selectedCategory ? (
              <p className="text-muted-foreground">Selecione uma categoria.</p>
            ):(
              <>
                {/* form novo tipo */}
                <form onSubmit={handleCreateType} className="grid grid-cols-2 gap-2">
                  <Input placeholder="Tipo de manutenção"       value={typeLabel}
                         onChange={e=>setTypeLabel(e.target.value)} required />
                  <Input placeholder="Ícone ex: GiBattery100" value={typeIcon}
                         onChange={e=>setTypeIcon(e.target.value)} required />
                  <Input placeholder="Descrição"   value={typeDescription}
                         onChange={e=>setTypeDescription(e.target.value)} className="col-span-2" required />
                  <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Top (%)"
                        value={position?.top || ""}
                        onChange={(e) =>
                          setPosition((prev) => ({ ...prev, top: e.target.value || "0%" }))
                        }required 
                      />
                      <Input
                        placeholder="Left (%)"
                        value={position?.left || ""}
                        onChange={(e) =>
                          setPosition((prev) => ({ ...prev, left: e.target.value || "0%" }))
                        }required 
                      />
                    </div>
                  <Button className="col-span-2" disabled={loading}>Criar Tipo</Button>
                </form>

                {/* lista tipos dessa categoria */}
                {types.filter(t=>t.categoryId===selectedCategory.id).map(t=>(
                  <div key={t.id} className="flex justify-between p-2 border rounded">
                    <span>{t.number} – <strong>{t.label}</strong></span>
                    <Button size="sm" variant="destructive"
                            onClick={()=>handleDeleteType(t.id)}>Excluir</Button>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
