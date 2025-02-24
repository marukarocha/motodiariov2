"use client";

import React from "react";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Trash,
  Check,
  X,
  Clock,
  DollarSign,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PerformanceThermometer from "@/app/earnings/components/termometro";
import { deleteEarning, updateEarning } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type Earning = {
  id: string;
  date: any; // Firestore Timestamp ou Date
  amount: number;
  mileage: number;
  platform: string;
  rideType?: string; // Passagem, Entrega, etc
  duration?: string; // Ex.: "15 min", etc.
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

  // Estados para edição inline
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);
  const [editingRowData, setEditingRowData] = React.useState<Partial<Earning> | null>(null);
  const [originalEditingRowData, setOriginalEditingRowData] = React.useState<Partial<Earning> | null>(null);

  // Estado para identificar a linha recentemente atualizada
  const [recentlyUpdatedRowId, setRecentlyUpdatedRowId] = React.useState<string | null>(null);

  // Opções pré-definidas
  const platformOptions = ['Uber', '99', 'Ifood', 'Indrive', 'Particular'];
  const rideTypeOptions = ['Passageiro', 'Entrega', 'Compras', 'Comida'];
  const durationOptions = ['15 min', '30 min', '45 min', '1 hora', '1h 30min', '2 horas', '3 horas ou mais'];

  // Mapeamento para converter duração em horas (para cálculo do ganho/hora)
  const durationToHours: Record<string, number> = {
    "15 min": 0.25,
    "30 min": 0.5,
    "45 min": 0.75,
    "1 hora": 1,
    "1h 30min": 1.5,
    "2 horas": 2,
    "3 horas ou mais": 3,
  };

  // Função para iniciar a edição (armazena os dados originais)
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
    setOriginalEditingRowData(editingData); // Armazena o valor original
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRowData(null);
    setOriginalEditingRowData(null);
  };

  // Função para salvar edição
  const handleSaveEdit = async (earningId: string) => {
    if (!currentUser) {
      alert("Usuário não autenticado!");
      return;
    }
    let updatedData: Partial<Earning> = { ...editingRowData };

    // Se o campo data não foi alterado, removemos-o da atualização
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
      // Define a linha atualizada para efeito visual
      setRecentlyUpdatedRowId(earningId);
      onRefresh();
      toast({
        title: "Atualizado com sucesso!",
        description: "Os ganhos foram atualizados.",
        variant: "success",
        className: "bg-green-700 text-white", // Fundo opaco para melhor leitura
      });
      // Após 2 segundos, remove o efeito visual
      setTimeout(() => setRecentlyUpdatedRowId(null), 2000);
    } catch (error) {
      console.error("Erro ao editar:", error);
    }
  };

  // Função para deletar com confirmação
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

  // Definição das colunas
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
                    setEditingRowData({
                      ...editingRowData,
                      platform: e.target.value,
                    })
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
                    setEditingRowData({
                      ...editingRowData,
                      rideType: e.target.value,
                    })
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
              {rideType && <Badge variant="outline">{platform} - {rideType}</Badge>}
            </div>
          );
        },
      },
      {
        accessorKey: "duration",
        header: () => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              Duração
            </div>
          </div>
        ),
        cell: ({ row }) => {
          if (editingRowId === row.original.id && editingRowData) {
            return (
              <select
                className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-800 text-white"
                value={editingRowData.duration || ""}
                onChange={(e) =>
                  setEditingRowData({
                    ...editingRowData,
                    duration: e.target.value,
                  })
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
          const duration = row.original.duration || "";
          const hours = durationToHours[duration] || 0;
          const amount = row.original.amount;
          const hourlyRate = hours > 0 ? amount / hours : 0;
          return (
            <div className="flex flex-col gap-1">
              {hours > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                   {duration || "-"} - R$ {hourlyRate.toFixed(2)}/h
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "desempenho",
        header: "Desempenho",
        cell: ({ row }) => {
          const earning = row.original;
          return (
            <PerformanceThermometer
              amount={earning.amount}
              mileage={earning.mileage}
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
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                  title="Cancelar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ações</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleDelete(earning.id)}>
                  <Trash className="mr-2 h-4 w-4 text-destructive" />
                  Deletar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(earning)}>
                  Editar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [editingRowId, editingRowData, currentUser, onRefresh, originalEditingRowData]
  );

  const table = useReactTable({
    data,
    columns,
    initialState: {
        pagination: { pageSize: 20 } // Exibe 10 registros por página
      },
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

  return (
    <div className="w-full">
      {/* Filtro por plataforma */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar pela plataforma..."
          value={(table.getColumn("platform")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("platform")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex items-center space-x-2 ml-6">
            <span className="text-sm">Exibir:</span>
            <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                table.setPageSize(Number(e.target.value));
                }}
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
                  recentlyUpdatedRowId && headerGroup.headers.some(h => h.column.id === recentlyUpdatedRowId)
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                key={row.id}
                className="hover:bg-stone-950 active:bg-stone-950 transition-colors"
              >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
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
