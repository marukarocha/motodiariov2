'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { getManutencoes, deleteManutencao } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import MaintenanceDashboard from "@/app/maintenance/MaintenanceDashboard"; // Botões para registrar manutenções
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Exemplo para filtro
import { Input } from "@/components/ui/input";

export default function ManutencoesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [manutencoes, setManutencoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>(""); // filtro por tipo

  const fetchManutencoes = async () => {
    setIsLoading(true);
    try {
      if (!currentUser) return;
      const data = await getManutencoes(currentUser.uid);
      setManutencoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar manutenções:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchManutencoes();
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    try {
      await deleteManutencao(currentUser.uid, id);
      setManutencoes(manutencoes.filter((m) => m.id !== id));
      toast({ title: "Manutenção deletada", description: "Registro removido com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao deletar manutenção.", variant: "destructive" });
    }
  };

  // Filtra as manutenções pelo tipo, se definido
  const filteredManutencoes = filterType
    ? manutencoes.filter((m) => m.tipo.toLowerCase() === filterType.toLowerCase())
    : manutencoes;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Header />
      <h1 className="text-2xl font-bold">Manutenções</h1>
      
      {/* Dashboard com botões para registrar manutenções */}
      <MaintenanceDashboard />

      {/* Filtro por Tipo */}
      <div className="flex items-center justify-between">
        <div>
          <label className="mr-2 font-medium">Filtrar por Tipo:</label>
          <select
            className="border rounded p-2"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="troca de óleo">Troca de Óleo</option>
            <option value="troca de pneus">Troca de Pneus</option>
            <option value="troca de relação">Troca de Relação</option>
            <option value="manutenção do motor">Manutenção do Motor</option>
            {/* Adicione outras opções conforme necessário */}
          </select>
        </div>
        {/* Opcional: campo de busca */}
        <Input
          placeholder="Buscar..."
          className="max-w-xs"
          // Implemente a lógica de busca se desejar
        />
      </div>

      {/* Listagem com DataTable */}
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>KM</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManutencoes.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.tipo}</TableCell>
                <TableCell>{m.data}</TableCell>
                <TableCell>{m.hora}</TableCell>
                <TableCell>{m.km}</TableCell>
                <TableCell>R$ {m.valor}</TableCell>
                <TableCell>{m.local}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(m.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
