'use client';

import React, { useState, useMemo } from "react";
import { Fueling } from "@/types/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateFueling, deleteFueling } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";

// Consumo médio da moto (km/L)
const AVERAGE_CONSUMPTION = 38;

// Função para converter uma string de data no formato "dd/mm/yyyy" para Date
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

export default function FuelingList({ fuelingsData, isLoading, error, fetchData }: FuelingListProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Estados para edição
  const [editingFuelingId, setEditingFuelingId] = useState<string | null>(null);
  const [editingFuelingData, setEditingFuelingData] = useState<Partial<Fueling> | null>(null);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Ordena os abastecimentos pela data (formato "dd/mm/yyyy") em ordem decrescente
  const sortedFuelings = useMemo(() => {
    const dataCopy = [...fuelingsData];
    dataCopy.sort((a, b) => {
      const dateA = parseDate(a.data);
      const dateB = parseDate(b.data);
      return dateB.getTime() - dateA.getTime();
    });
    return dataCopy;
  }, [fuelingsData]);

  // Paginação
  const totalPages = Math.ceil(sortedFuelings.length / recordsPerPage);
  const paginatedFuelings = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return sortedFuelings.slice(startIndex, startIndex + recordsPerPage);
  }, [sortedFuelings, currentPage]);

  // Funções para edição
  const handleEdit = (fueling: Fueling) => {
    setEditingFuelingId(fueling.id);
    setEditingFuelingData({ ...fueling });
  };

  const handleCancelEdit = () => {
    setEditingFuelingId(null);
    setEditingFuelingData(null);
  };

  const handleSaveEdit = async (fuelingId: string) => {
    if (!currentUser) return;
    try {
      await updateFueling(currentUser.uid, fuelingId, editingFuelingData || {});
      toast({
        title: "Atualizado",
        description: "Abastecimento atualizado com sucesso!",
        variant: "success",
      });
      setEditingFuelingId(null);
      setEditingFuelingData(null);
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar abastecimento:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar abastecimento",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fuelingId: string) => {
    if (!currentUser) return;
    const confirmed = window.confirm("Tem certeza que deseja excluir este abastecimento?");
    if (!confirmed) return;
    try {
      await deleteFueling(currentUser.uid, fuelingId);
      toast({ title: "Excluído", description: "Abastecimento excluído com sucesso!" });
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir abastecimento:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir abastecimento",
        variant: "destructive",
      });
    }
  };

  // Funções para cálculos
  const calculateTotalValue = (litros: number, valorLitro: number): number =>
    litros * valorLitro;

  const calculateTotalKm = (litros: number): number =>
    litros * AVERAGE_CONSUMPTION;

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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFuelings.map((fueling) => (
                <TableRow key={fueling.id}>
                  {/* Data */}
                  <TableCell>
                    {editingFuelingId === fueling.id ? (
                      <Input
                        type="text"
                        value={editingFuelingData?.data || ""}
                        onChange={(e) =>
                          setEditingFuelingData({ ...editingFuelingData, data: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      fueling.data
                    )}
                  </TableCell>
                  {/* Hora */}
                  <TableCell>
                    {editingFuelingId === fueling.id ? (
                      <Input
                        type="text"
                        value={editingFuelingData?.hora || ""}
                        onChange={(e) =>
                          setEditingFuelingData({ ...editingFuelingData, hora: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      fueling.hora
                    )}
                  </TableCell>
                  {/* Litros */}
                  <TableCell>
                    {editingFuelingId === fueling.id ? (
                      <Input
                        type="number"
                        value={editingFuelingData?.litros?.toString() || ""}
                        onChange={(e) =>
                          setEditingFuelingData({
                            ...editingFuelingData,
                            litros: parseFloat(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    ) : (
                      fueling.litros
                    )}
                  </TableCell>
                  {/* Posto */}
                  <TableCell>
                    {editingFuelingId === fueling.id ? (
                      <Input
                        type="text"
                        value={editingFuelingData?.posto || ""}
                        onChange={(e) =>
                          setEditingFuelingData({ ...editingFuelingData, posto: e.target.value })
                        }
                        className="w-full"
                      />
                    ) : (
                      fueling.posto
                    )}
                  </TableCell>
                  {/* Valor por Litro */}
                  <TableCell>
                    {editingFuelingId === fueling.id ? (
                      <Input
                        type="number"
                        value={editingFuelingData?.valorLitro?.toString() || ""}
                        onChange={(e) =>
                          setEditingFuelingData({
                            ...editingFuelingData,
                            valorLitro: parseFloat(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    ) : (
                      `R$ ${Number(fueling.valorLitro).toFixed(2)}`
                    )}
                  </TableCell>
                  {/* Valor Total */}
                  <TableCell>
                    {editingFuelingId === fueling.id ? (
                      <span>
                        R${" "}
                        {editingFuelingData
                          ? calculateTotalValue(
                              Number(editingFuelingData.litros),
                              Number(editingFuelingData.valorLitro)
                            ).toFixed(2)
                          : "0.00"}
                      </span>
                    ) : (
                      `R$ ${calculateTotalValue(
                        Number(fueling.litros),
                        Number(fueling.valorLitro)
                      ).toFixed(2)}`
                    )}
                  </TableCell>
                  {/* Km Totais */}
                  <TableCell>
                    {editingFuelingId === fueling.id ? (
                      <span>
                        {editingFuelingData
                          ? `${calculateTotalKm(Number(editingFuelingData.litros)).toFixed(0)} km`
                          : "0 km"}
                      </span>
                    ) : (
                      `${calculateTotalKm(Number(fueling.litros)).toFixed(0)} km`
                    )}
                  </TableCell>
                  {/* Ações */}
                  <TableCell>
                    {editingFuelingId === fueling.id ? (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSaveEdit(fueling.id)}
                          title="Salvar edição"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={handleCancelEdit} title="Cancelar">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => handleEdit(fueling)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(fueling.id)}
                          title="Deletar"
                        >
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
