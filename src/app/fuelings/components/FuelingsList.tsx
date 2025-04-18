'use client';

import React, { useState, useMemo } from "react";
import { Fueling } from "@/types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateFueling, deleteFueling } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";

// Consumo médio da moto (km/L)
const AVERAGE_CONSUMPTION = 38;

// Converte string "dd/mm/yyyy" para Date
const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split("/");
  return new Date(Number(year), Number(month) - 1, Number(day));
};

interface FuelingListProps {
  fuelingsData: Fueling[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => void;
}

export default function FuelingList({
  fuelingsData,
  isLoading,
  error,
  fetchData
}: FuelingListProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Estados para edição
  const [editingFuelingId, setEditingFuelingId] = useState<string | null>(null);
  const [editingFuelingData, setEditingFuelingData] = useState<Partial<Fueling> | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Ordena registros por data (mais recente primeiro)
  const sortedFuelings = useMemo(() => {
    const copy = [...fuelingsData];
    copy.sort((a, b) => {
      const dateA = parseDate(a.data);
      const dateB = parseDate(b.data);
      return dateB.getTime() - dateA.getTime();
    });
    return copy;
  }, [fuelingsData]);

  const totalPages = Math.ceil(sortedFuelings.length / recordsPerPage);
  const paginatedFuelings = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return sortedFuelings.slice(start, start + recordsPerPage);
  }, [sortedFuelings, currentPage]);

  const handleEdit = (f: Fueling) => {
    setEditingFuelingId(f.id);
    setEditingFuelingData({ ...f });
  };

  const handleCancelEdit = () => {
    setEditingFuelingId(null);
    setEditingFuelingData(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!currentUser || !editingFuelingData) return;
    try {
      await updateFueling(currentUser.uid, id, editingFuelingData);
      toast({ title: "Atualizado", description: "Abastecimento atualizado com sucesso!", variant: "success" });
      handleCancelEdit();
      fetchData();
    } catch {
      toast({ title: "Erro", description: "Falha ao atualizar abastecimento", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    if (!window.confirm("Tem certeza que deseja excluir este abastecimento?")) return;
    try {
      await deleteFueling(currentUser.uid, id);
      toast({ title: "Excluído", description: "Abastecimento excluído com sucesso!" });
      fetchData();
    } catch {
      toast({ title: "Erro", description: "Falha ao excluir abastecimento", variant: "destructive" });
    }
  };

  const calculateTotalValue = (litros: number, valor: number) => litros * valor;
  const calculateTotalKm = (litros: number) => litros * AVERAGE_CONSUMPTION;

  return (
    <div>
      {isLoading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <> 
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Posto</TableHead>
                <TableHead>Valor por Litro (R$)</TableHead>
                <TableHead>Valor Total (R$)</TableHead>
                <TableHead>Km Totais</TableHead>
                <TableHead>Tanque Cheio?</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFuelings.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    {editingFuelingId === f.id ? (
                      <Input
                        type="text"
                        value={editingFuelingData?.data || ''}
                        onChange={(e) => setEditingFuelingData({ ...editingFuelingData, data: e.target.value })}
                      />
                    ) : (
                      f.data
                    )}
                  </TableCell>
                  <TableCell>
                    {editingFuelingId === f.id ? (
                      <Input
                        type="text"
                        value={editingFuelingData?.hora || ''}
                        onChange={(e) => setEditingFuelingData({ ...editingFuelingData, hora: e.target.value })}
                      />
                    ) : (
                      f.hora
                    )}
                  </TableCell>
                  <TableCell>
                    {editingFuelingId === f.id ? (
                      <Input
                        type="number"
                        value={editingFuelingData?.litros?.toString() || ''}
                        onChange={(e) => setEditingFuelingData({ ...editingFuelingData, litros: parseFloat(e.target.value) })}
                      />
                    ) : (
                      f.litros
                    )}
                  </TableCell>
                  <TableCell>
                    {editingFuelingId === f.id ? (
                      <Input
                        type="text"
                        value={editingFuelingData?.posto || ''}
                        onChange={(e) => setEditingFuelingData({ ...editingFuelingData, posto: e.target.value })}
                      />
                    ) : (
                      f.posto
                    )}
                  </TableCell>
                  <TableCell>
                    {editingFuelingId === f.id ? (
                      <Input
                        type="number"
                        value={editingFuelingData?.valorLitro?.toString() || ''}
                        onChange={(e) => setEditingFuelingData({ ...editingFuelingData, valorLitro: parseFloat(e.target.value) })}
                      />
                    ) : (
                      `R$ ${Number(f.valorLitro).toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>
                    {`R$ ${calculateTotalValue(Number(f.litros), Number(f.valorLitro)).toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    {`${calculateTotalKm(Number(f.litros)).toFixed(0)} km`}
                  </TableCell>
                  <TableCell>
                    {editingFuelingId === f.id ? (
                      <input
                        type="checkbox"
                        checked={!!editingFuelingData?.fullTank}
                        onChange={(e) => setEditingFuelingData({ ...editingFuelingData, fullTank: e.target.checked })}
                      />
                    ) : (
                      <span className={f.fullTank ? 'text-green-500 font-bold' : 'text-muted'}>
                        {f.fullTank ? 'Sim' : 'Não'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingFuelingId === f.id ? (
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => handleSaveEdit(f.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => handleEdit(f)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => handleDelete(f.id)}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span>Página {currentPage} de {totalPages}</span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
