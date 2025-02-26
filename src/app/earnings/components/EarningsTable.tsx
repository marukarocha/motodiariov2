"use client";

import React, { useRef } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  ChevronDown,
  Trash,
  Check,
  Pencil,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Desempenho from "@/app/earnings/components/desempenho";
import { deleteEarning, updateEarning } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLongPress, useOutsideClick } from "@/hooks/useLongPress";

export type Earning = {
  id: string;
  date: any; // Firestore Timestamp ou Date
  amount: number;
  mileage: number;
  platform: string;
  rideType?: string;
  duration?: string;
};

interface DataTableEarningsProps {
  data: Earning[];
  onRefresh: () => void;
}

export function DataTableEarnings({ data, onRefresh }: DataTableEarningsProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Estados do Tanstack React Table
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Estados de edição
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);
  const [editingRowData, setEditingRowData] = React.useState<Partial<Earning> | null>(null);
  const [originalEditingRowData, setOriginalEditingRowData] = React.useState<Partial<Earning> | null>(null);

  // Para dar feedback visual
  const [recentlyUpdatedRowId, setRecentlyUpdatedRowId] = React.useState<string | null>(null);

  // Opções pré-definidas
  const platformOptions = ["Uber", "99", "Ifood", "Indrive", "Particular"];
  const rideTypeOptions = ["Passageiro", "Entrega", "Compras", "Comida"];
  const durationOptions = ["15 min", "30 min", "45 min", "1 hora", "1h 30min", "2 horas", "3 horas ou mais"];

  // 1) Crie um ref para a linha em edição
  const editRowRef = useRef<HTMLTableRowElement | null>(null);

  // 2) Use o hook useOutsideClick para fechar edição se clicar fora da row
  useOutsideClick(editRowRef, () => {
    if (editingRowId) {
      handleCancelEdit();
    }
  });

  // ---- Lógica de edição ----
  const handleEdit = (earning: Earning) => {
    setEditingRowId(earning.id);
    const dateISO =
      earning.date && earning.date.seconds
        ? new Date(earning.date.seconds * 1000).toISOString().slice(0, 16)
        : earning.date instanceof Date
        ? earning.date.toISOString().slice(0, 16)
        : "";
    const editingData = { ...earning, date: dateISO };
    setEditingRowData(editingData);
    setOriginalEditingRowData(editingData);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRowData(null);
    setOriginalEditingRowData(null);
  };

  const handleSaveEdit = async (earningId: string) => {
    if (!currentUser) {
      alert("Usuário não autenticado!");
      return;
    }
    let updatedData: Partial<Earning> = { ...editingRowData };

    // Se data não mudou, removemos do update
    if (
      editingRowData?.date &&
      originalEditingRowData &&
      editingRowData.date === originalEditingRowData.date
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
      setOriginalEditingRowData(null);
      setRecentlyUpdatedRowId(earningId);
      onRefresh();
      toast({
        title: "Atualizado com sucesso!",
        description: "Os ganhos foram atualizados.",
        variant: "success",
        className: "bg-green-700 text-white",
      });
      setTimeout(() => setRecentlyUpdatedRowId(null), 2000);
    } catch (error) {
      console.error("Erro ao editar:", error);
    }
  };

  const handleDelete = async (earningId: string) => {
    if (!currentUser) {
      alert("Usuário não autenticado!");
      return;
    }
    const confirmed = window.confirm("Confirma a exclusão? Essa ação não tem volta.");
    if (!confirmed) return;
    try {
      await deleteEarning(currentUser.uid, earningId);
      onRefresh();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  // ---- Definição das colunas ----
  const columns = React.useMemo<ColumnDef<Earning>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0"
          >
            Data/Hora
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          if (editingRowId === row.original.id && editingRowData) {
            return (
              <input
                type="datetime-local"
                className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-700 text-white"
                value={editingRowData.date as string}
                onChange={(e) =>
                  setEditingRowData({ ...editingRowData, date: e.target.value })
                }
              />
            );
          }
          const dateVal = row.original.date;
          if (!dateVal) return "N/A";
          try {
            let d = dateVal;
            if (dateVal.seconds) {
              d = new Date(dateVal.seconds * 1000);
            }
            return Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(d);
          } catch (err) {
            return "Data inválida";
          }
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Valor (R$)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          if (editingRowId === row.original.id && editingRowData) {
            return (
              <input
                type="number"
                step="0.01"
                className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-700 text-white"
                value={editingRowData.amount?.toString() || ""}
                onChange={(e) =>
                  setEditingRowData({
                    ...editingRowData,
                    amount: parseFloat(e.target.value),
                  })
                }
              />
            );
          }
          const val = row.getValue("amount") as number;
          return `R$ ${val.toFixed(2)}`;
        },
      },
      {
        accessorKey: "mileage",
        header: "KM",
        cell: ({ row }) => {
          if (editingRowId === row.original.id && editingRowData) {
            return (
              <input
                type="number"
                step="0.01"
                className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-700 text-white"
                value={editingRowData.mileage?.toString() || ""}
                onChange={(e) =>
                  setEditingRowData({
                    ...editingRowData,
                    mileage: parseFloat(e.target.value),
                  })
                }
              />
            );
          }
          const km = row.getValue("mileage") as number;
          return km.toFixed(2);
        },
      },
      {
        accessorKey: "platform",
        header: "Plataforma / Tipo",
        cell: ({ row }) => {
          if (editingRowId === row.original.id && editingRowData) {
            return (
              <div className="flex flex-col gap-1">
                <select
                  className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-800 text-white"
                  value={editingRowData.platform || ""}
                  onChange={(e) =>
                    setEditingRowData({ ...editingRowData, platform: e.target.value })
                  }
                >
                  <option value="">Selecione</option>
                  {platformOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-800 text-white"
                  value={editingRowData.rideType || ""}
                  onChange={(e) =>
                    setEditingRowData({ ...editingRowData, rideType: e.target.value })
                  }
                >
                  <option value="">Selecione</option>
                  {rideTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          const platform = row.original.platform;
          const rideType = row.original.rideType;
          return (
            <div className="flex flex-col gap-1">
              <Badge variant="outline">
                {platform}
                {rideType ? ` - ${rideType}` : ""}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "desempenho",
        header: "Desempenho",
        cell: ({ row }) => {
          const earning = row.original;
          if (editingRowId === row.original.id && editingRowData) {
            return (
              <select
                className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-800 text-white"
                value={editingRowData.duration || ""}
                onChange={(e) =>
                  setEditingRowData({ ...editingRowData, duration: e.target.value })
                }
              >
                <option value="">Selecione</option>
                {durationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <Desempenho
              amount={earning.amount}
              mileage={earning.mileage}
              duration={earning.duration}
            />
          );
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const earning = row.original;
          if (editingRowId === row.original.id) {
            return (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleSaveEdit(earning.id)}
                  title="Salvar edição"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={handleCancelEdit} title="Cancelar">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => handleEdit(earning)} title="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => handleDelete(earning.id)} title="Deletar">
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      editingRowId,
      editingRowData,
      currentUser,
      onRefresh,
      originalEditingRowData,
      platformOptions,
      rideTypeOptions,
      durationOptions,
    ]
  );

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize: 20 } },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Hook para detectar toque prolongado e ativar edição (para mobile)
  // Aplica-se nos <TableRow> que não estejam em edição
  return (
    <div className="w-full">
      {/* Filtro por plataforma */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar pela plataforma..."
          value={(table.getColumn("platform")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("platform")?.setFilterValue(event.target.value)}
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
              <TableRow
                key={headerGroup.id}
                className={
                  recentlyUpdatedRowId &&
                  headerGroup.headers.some((h) => h.column.id === recentlyUpdatedRowId)
                    ? "bg-green-500/50 transition-colors duration-1000"
                    : ""
                }
              >
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
              table.getRowModel().rows.map((row) => {
                const isEditingThisRow = editingRowId === row.original.id;
                const longPressEvents = useLongPress(() => {
                  // Só entra em edição se não estiver editando outra row
                  if (!editingRowId) handleEdit(row.original);
                }, 500);

                return (
                  <TableRow
                    key={row.id}
                    // Se for a row em edição, atribui o ref
                    ref={isEditingThisRow ? editRowRef : null}
                    className="hover:bg-stone-950 active:bg-stone-950 transition-colors"
                    onDoubleClick={() => {
                      if (!editingRowId) handleEdit(row.original);
                    }}
                    {...(!isEditingThisRow ? longPressEvents : {})}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
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

      {/* Paginação */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionadas.
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
    </div>
  );
}
