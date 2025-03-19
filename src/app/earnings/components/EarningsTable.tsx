"use client";

import React, { useState } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EarningsRow, Earning } from "@/app/earnings/components/Earningsrow";
import { useLongPress, useOutsideClick } from "@/hooks/useLongPress";
import { updateEarning } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDeleteEarning } from "@/hooks/useDeleteEarning";
import { Eye, EyeOff } from "lucide-react";

export function DataTableEarnings({ data, onRefresh }: { data: Earning[]; onRefresh: () => void }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { deleteEarningAndOdometer } = useDeleteEarning();

  // Estados de edição
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<Partial<Earning> | null>(null);

  // Estado para controlar se a lista está expandida (visível)
  const [expanded, setExpanded] = useState(true);

  // Funções de edição
  const handleEdit = (earning: Earning) => {
    setEditingRowId(earning.id);
    const dateISO =
      earning.date && earning.date.seconds
        ? new Date(earning.date.seconds * 1000).toISOString().slice(0, 16)
        : earning.date instanceof Date
        ? earning.date.toISOString().slice(0, 16)
        : "";
    setEditingRowData({ ...earning, date: dateISO });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRowData(null);
  };

  const handleSaveEdit = async (earningId: string) => {
    if (!currentUser) {
      alert("Usuário não autenticado!");
      return;
    }
    let updatedData: Partial<Earning> = { ...editingRowData };

    if (
      editingRowData?.date &&
      updatedData.date &&
      updatedData.date === (editingRowData.date as string)
    ) {
      delete updatedData.date;
    } else if (updatedData?.date && updatedData.date !== "") {
      updatedData.date = new Date(updatedData.date);
    } else {
      delete updatedData.date;
    }
    try {
      await updateEarning(currentUser.uid, earningId, updatedData);
      setEditingRowId(null);
      setEditingRowData(null);
      onRefresh();
      toast({
        title: "Atualizado com sucesso!",
        description: "Os ganhos foram atualizados.",
        variant: "success",
        className: "bg-green-700 text-white",
      });
    } catch (error) {
      console.error("Erro ao editar:", error);
    }
  };

  const handleDelete = async (earningId: string, earningDate?: Date) => {
    if (!currentUser) {
      alert("Usuário não autenticado!");
      return;
    }
   
    try {
      let dateObj: Date | undefined = undefined;
      const found = data.find((e) => e.id === earningId)?.date;
      if (found) {
        dateObj = found.seconds ? new Date(found.seconds * 1000) : new Date(found);
      }
      await deleteEarningAndOdometer(earningId, dateObj);
      onRefresh();
      toast({ title: "Excluído", description: "Registro removido com sucesso." });
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast({ title: "Erro", description: "Erro ao deletar registro.", variant: "destructive" });
    }
  };

  // Configuração básica do Tanstack Table para filtros, paginação e ordenação
  const columns = React.useMemo(() => [
    { header: "Data/Hora", accessorKey: "date" },
    { header: "Valor (R$)", accessorKey: "amount" },
    { header: "KM", accessorKey: "mileage" },
    { header: "Plataforma / Tipo", accessorKey: "platform" },
    { header: "Desempenho", accessorKey: "duration" },
    { header: "Ações", accessorKey: "actions" },
  ], []);

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize: 20 } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      {/* Header da lista com título e botão de alternância */}
     

      {/* Se a lista estiver expandida, renderiza o conteúdo */}
      {expanded && (
        <>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filtrar pela plataforma..."
              value={(table.getColumn("platform")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("platform")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <div className="flex items-center space-x-2 ml-6">
              <span className="text-sm">Exibir:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="border rounded p-1 text-sm"
              >
                {[5, 10, 20, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} registros
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <EarningsRow
                      key={row.original.id}
                      earning={row.original}
                      isEditing={editingRowId === row.original.id}
                      editingRowData={editingRowData}
                      onEdit={handleEdit}
                      onCancelEdit={handleCancelEdit}
                      onSaveEdit={handleSaveEdit}
                      onDelete={handleDelete}
                      setEditingRowData={setEditingRowData}
                      platformOptions={["Uber", "99", "Ifood", "Indrive", "Particular"]}
                      rideTypeOptions={["Passageiro", "Entrega", "Compras", "Comida"]}
                      durationOptions={["15 min", "30 min", "45 min", "1 hora", "1h 30min", "2 horas", "3 horas ou mais"]}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhum resultado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} linha(s) selecionadas.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Próximo
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
