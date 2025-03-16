"use client";

import { useState, useEffect } from "react";
import { getMaintenance, deleteMaintenance, getBikeData } from "@/lib/db/firebaseServices";
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
import { Trash, Pencil } from "lucide-react";
import MaintenanceDashboard from "@/app/maintenance/MaintenanceDashboard";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

// Fallback para maintenanceDefinitions, se a configuração do usuário não estiver disponível
const maintenanceDefinitions: { [key: string]: number } = {
  "troca de pneus": 10000,
  "troca de relação": 8000,
  "manutenção do motor": 12000,
};

export default function ManutencoesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [manutencoes, setManutencoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("");
  const [bikeConfig, setBikeConfig] = useState<any>(null);

  const fetchManutencoes = async () => {
    setIsLoading(true);
    try {
      if (!currentUser) return;
      const data = await getMaintenance(currentUser.uid);
      setManutencoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar manutenções:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar manutenções.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Busca a configuração da bike para obter os intervalos definidos pelo usuário
  const fetchBikeConfig = async () => {
    if (!currentUser) return;
    try {
      const config = await getBikeData(currentUser.uid);
      setBikeConfig(config);
    } catch (error) {
      console.error("Erro ao carregar configuração da bike:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchManutencoes();
      fetchBikeConfig();
    }
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteMaintenance(currentUser.uid, id);
      setManutencoes(manutencoes.filter((m) => m.id !== id));
      toast({ title: "Manutenção deletada", description: "Registro removido com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao deletar manutenção.", variant: "destructive" });
    }
  };

  // Stub para edição – ajuste conforme necessário
  const handleEdit = (id: string) => {
    router.push(`/maintenance/edit/${id}`);
  };

  // Filtra as manutenções pelo tipo, se definido
  const filteredManutencoes = filterType
    ? manutencoes.filter((m) => m.tipo.toLowerCase() === filterType.toLowerCase())
    : manutencoes;

  return (
    <div className="container mx-auto p-4 space-y-6">
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
          </select>
        </div>
        <Input
          placeholder="Buscar..."
          className="max-w-xs"
          // Implemente a lógica de busca se desejar
        />
      </div>

      {/* Listagem */}
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>KM</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Próxima Troca</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManutencoes.map((m) => {
              // Converte timestamp para exibição se existir, senão usa os campos antigos
              const displayDate =
                m.timestamp && typeof m.timestamp.toDate === "function"
                  ? m.timestamp.toDate().toLocaleString("pt-BR")
                  : `${m.data} ${m.hora}`;

              // Determina o intervalo para a próxima troca com base no tipo
              let interval = 0;
              if (bikeConfig) {
                // Para "troca de óleo", usa o oilChangeInterval da configuração
                if (m.tipo.toLowerCase() === "troca de óleo" && bikeConfig.oilChangeInterval) {
                  interval = Number(bikeConfig.oilChangeInterval);
                }
                // Adicione aqui outras condições se necessário (ex: troca de pneus, etc.)
              } else {
                // Fallback usando maintenanceDefinitions
                interval = maintenanceDefinitions[m.tipo.toLowerCase()] || 0;
              }

              const proximaTroca = Number(m.km) + interval;

              return (
                <TableRow key={m.id}>
                  <TableCell>{m.tipo}</TableCell>
                  <TableCell>{displayDate}</TableCell>
                  <TableCell>{m.km}</TableCell>
                  <TableCell>R$ {m.valor}</TableCell>
                  <TableCell>{m.local}</TableCell>
                  <TableCell>{proximaTroca} km</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(m.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(m.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
