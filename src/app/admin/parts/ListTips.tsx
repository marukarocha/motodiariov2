"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  category: string;
}

interface Tip {
  id: string;
  title: string;
  message: string;
  icon?: string;
  order?: number;
  visible: boolean;
  categoryId: string;
}

export default function ListTips() {
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState("");
  const [order, setOrder] = useState(0);
  const [visible, setVisible] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchTips();
  }, []);

  async function fetchCategories() {
    const res = await fetch("/api/admin/maintenance/categories");
    if (res.ok) setCategories(await res.json());
  }

  async function fetchTips() {
    const res = await fetch("/api/admin/maintenance/tips");
    if (res.ok) setTips(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = { title, message, icon, order, visible, categoryId };

    const res = await fetch(
      editId
        ? `/api/admin/maintenance/tips/${editId}`
        : "/api/admin/maintenance/tips",
      {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      toast({ title: editId ? "Dica atualizada" : "Dica criada", variant: "success" });
      resetForm();
      fetchTips();
    } else {
      let error = { error: "Erro ao salvar dica" };
      try {
        error = await res.json();
      } catch (_) {
        // resposta vazia, erro genérico
      }
      toast({ title: error?.error || "Erro ao salvar dica", variant: "destructive" });
    }

    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setMessage("");
    setIcon("");
    setOrder(0);
    setVisible(true);
    setCategoryId("");
    setEditId(null);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/maintenance/tips/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Dica excluída", variant: "success" });
      fetchTips();
    } else {
      toast({ title: "Erro ao excluir dica", variant: "destructive" });
    }
  }

  function handleEdit(tip: Tip) {
    setEditId(tip.id);
    setTitle(tip.title);
    setMessage(tip.message);
    setIcon(tip.icon || "");
    setOrder(tip.order || 0);
    setVisible(tip.visible);
    setCategoryId(tip.categoryId);
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-extrabold text-center">Dicas Manuais</h1>

      <Card>
        <CardHeader>
          <CardTitle>{editId ? "Editar Dica" : "Nova Dica"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Título da dica" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input placeholder="Ícone (opcional)" value={icon} onChange={(e) => setIcon(e.target.value)} />
            <Input
              placeholder="Mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-1 md:col-span-2"
              required
            />
            <select
              className="border rounded px-2 py-1"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category}
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Ordem (opcional)"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value))}
            />
            <div className="flex items-center gap-2">
              <Switch checked={visible} onCheckedChange={setVisible} />
              <label>Visível</label>
            </div>
            <Button type="submit" className="col-span-1 md:col-span-2" disabled={loading}>
              {editId ? "Salvar Alterações" : "Criar Dica"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dicas Existentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tips.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma dica cadastrada ainda.</p>
          ) : (
            tips.map((tip) => (
              <div key={tip.id} className="border p-2 rounded flex justify-between items-center">
                <div>
                  <strong>{tip.title}</strong> – {tip.message}
                  <div className="text-xs text-muted-foreground">
                    Categoria: {categories.find((c) => c.id === tip.categoryId)?.category || "?"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(tip)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(tip.id)}>Excluir</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
