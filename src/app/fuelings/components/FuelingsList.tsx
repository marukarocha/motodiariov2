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

interface FuelingListProps {
  fuelingsData: Fueling[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => void;
}

export default function FuelingList({ fuelingsData, isLoading, error, fetchData }: FuelingListProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [editingFuelingId, setEditingFuelingId] = useState<string | null>(null);
  const [editingFuelingData, setEditingFuelingData] = useState<Partial<Fueling> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const sortedFuelings = useMemo(() => {
    const copy = [...fuelingsData];
    copy.sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());
    return copy.reverse();
  }, [fuelingsData]);

  const totalPages = Math.ceil(sortedFuelings.length / recordsPerPage);
  const paginatedFuelings = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return sortedFuelings.slice(start, start + recordsPerPage);
  }, [sortedFuelings, currentPage]);

  const handleEdit = (fueling: Fueling) => {
    setEditingFuelingId(fueling.id);
    setEditingFuelingData({ ...fueling });
  };

  const handleCancelEdit = () => {
    setEditingFuelingId(null);
    setEditingFuelingData(null);
  };

  const handleSaveEdit = async (fuelingId: string) => {
    if (!currentUser || !editingFuelingData) return;
    try {
      await updateFueling(currentUser.uid, fuelingId, editingFuelingData);
      toast({ title: "Atualizado", description: "Abastecimento salvo com sucesso!", variant: "success" });
      handleCancelEdit();
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast({ title: "Erro", description: "Falha ao atualizar abastecimento.", variant: "destructive" });
    }
  };

  const handleDelete = async (fuelingId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    try {
      await deleteFueling(currentUser.uid, fuelingId);
      toast({ title: "Excluído", description: "Abastecimento excluído com sucesso!" });
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({ title: "Erro", description: "Falha ao excluir abastecimento.", variant: "destructive" });
    }
  };

  return (
    <div>
      {isLoading ? <p>Carregando...</p> : error ? <p className="text-red-500">{error}</p> : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Posto</TableHead>
                <TableHead>Valor por Litro</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Km Rodados</TableHead>
                <TableHead>Tanque Cheio</TableHead>
                <TableHead>Δ KM</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFuelings.map((fueling, index) => {
                const anterior = sortedFuelings[sortedFuelings.indexOf(fueling) + 1];
                const diffKm = anterior && fueling.currentMileage && anterior.currentMileage
                  ? `${fueling.currentMileage - anterior.currentMileage} km`
                  : "-";

                return (
                  <TableRow key={fueling.id}>
                    <TableCell>{fueling.date.toDate().toLocaleDateString()}</TableCell>
                    <TableCell>{fueling.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>{fueling.litros}</TableCell>
                    <TableCell>{fueling.posto}</TableCell>
                    <TableCell>R$ {fueling.valorLitro.toFixed(2)}</TableCell>
                    <TableCell>R$ {(fueling.litros * fueling.valorLitro).toFixed(2)}</TableCell>
                    <TableCell>{fueling.currentMileage} km</TableCell>
                    <TableCell>{fueling.fullTank ? "Sim" : "Não"}</TableCell>
                    <TableCell>{diffKm}</TableCell>
                    <TableCell>
                      {editingFuelingId === fueling.id ? (
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => handleSaveEdit(fueling.id)}><Check className="h-4 w-4" /></Button>
                          <Button variant="ghost" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => handleEdit(fueling)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" onClick={() => handleDelete(fueling.id)}><Trash className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</Button>
            <span>Página {currentPage} de {totalPages}</span>
            <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Próximo</Button>
          </div>
        </>
      )}
    </div>
  );
}
