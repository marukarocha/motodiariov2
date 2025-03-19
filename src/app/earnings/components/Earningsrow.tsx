"use client";

import React, { useRef } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash, Check, Pencil, X } from "lucide-react";
import { useLongPress, useOutsideClick } from "@/hooks/useLongPress";
import Desempenho from "@/app/earnings/components/desempenho";
import { Timestamp } from "firebase/firestore";

export type Earning = {
  id: string;
  date: any; // Firestore Timestamp ou Date
  amount: number;
  mileage: number;
  platform: string;
  rideType?: string;
  duration?: string;
  description?: string;
  tip?: number;
};

interface EarningsRowProps {
  earning: Earning;
  isEditing: boolean;
  editingRowData: Partial<Earning> | null;
  onEdit: (earning: Earning) => void;
  onCancelEdit: () => void;
  onSaveEdit: (earningId: string, updatedData: Partial<Earning>) => void;
  onDelete: (earningId: string, earningDate?: Date) => void;
  setEditingRowData: (data: Partial<Earning>) => void;
  platformOptions: string[];
  rideTypeOptions: string[];
  durationOptions: string[];
}

export function EarningsRow({
  earning,
  isEditing,
  editingRowData,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  setEditingRowData,
  platformOptions,
  rideTypeOptions,
  durationOptions,
}: EarningsRowProps) {
  // Determina se o registro é promoção (rideType igual a "promoção", ignorando caixa)
  const isPromotion = earning.rideType?.toLowerCase() === "promoção";

  const longPressEvents = useLongPress(() => {
    if (!isEditing) onEdit(earning);
  }, 500);

  const editRowRef = useRef<HTMLTableRowElement | null>(null);
  useOutsideClick(editRowRef, () => {
    if (isEditing) onCancelEdit();
  });

  const formatDate = (dateVal: any) => {
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
  };

  // Se for promoção, define fundo verde escuro
  const rowClasses = isPromotion ? "bg-green-900" : "hover:bg-stone-950 active:bg-stone-950 transition-colors";

  // Handler para salvar edição, garantindo a conversão da data
  const handleSave = () => {
    let updatedData: Partial<Earning> = { ...editingRowData };

    // Se o campo date foi alterado, converte a string para objeto Date
    if (editingRowData?.date) {
      // O input datetime-local retorna algo como "2025-03-17T10:08"
      const newDateObj = new Date(editingRowData.date as string);
      if (!isNaN(newDateObj.getTime())) {
        // Se a função updateEarning espera um objeto Date:
        updatedData.date = newDateObj;
        // Caso prefira utilizar o Timestamp do Firebase, descomente a linha abaixo:
        // updatedData.date = Timestamp.fromDate(newDateObj);
      } else {
        console.error("Data inválida:", editingRowData.date);
      }
    }
    onSaveEdit(earning.id, updatedData);
  };

  return (
    <TableRow
      ref={isEditing ? editRowRef : null}
      className={rowClasses}
      onDoubleClick={() => { if (!isEditing) onEdit(earning); }}
      {...longPressEvents}
    >
      {/* Coluna Data/Hora */}
      <TableCell>
        {isEditing && editingRowData ? (
          <input
            type="datetime-local"
            className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-700 text-white"
            // Assegure que editingRowData.date esteja em formato "YYYY-MM-DDTHH:mm"
            value={editingRowData.date as string}
            onChange={(e) =>
              setEditingRowData({ ...editingRowData, date: e.target.value })
            }
          />
        ) : (
          formatDate(earning.date)
        )}
      </TableCell>

      {/* Coluna Valor */}
      <TableCell>
        {isEditing && editingRowData ? (
          <input
            type="number"
            step="0.01"
            className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-700 text-white"
            value={editingRowData.amount?.toString() || ""}
            onChange={(e) =>
              setEditingRowData({ ...editingRowData, amount: parseFloat(e.target.value) })
            }
          />
        ) : (
          <div>
            <div>{`R$ ${earning.amount.toFixed(2)}`}</div>
            {earning.tip !== undefined && earning.tip > 0 && (
              <div className="text-xs text-gray-300">{`Gorjeta: R$ ${earning.tip.toFixed(2)}`}</div>
            )}
          </div>
        )}
      </TableCell>

      {/* Coluna KM */}
      <TableCell>
        {isEditing && !isPromotion ? (
          <input
            type="number"
            step="0.01"
            className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-700 text-white"
            value={editingRowData.mileage?.toString() || ""}
            onChange={(e) =>
              setEditingRowData({ ...editingRowData, mileage: parseFloat(e.target.value) })
            }
          />
        ) : (
          Number(earning.mileage).toFixed(2)
        )}
      </TableCell>

      {/* Coluna Plataforma / Tipo */}
      <TableCell>
        {isEditing && !isPromotion ? (
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
        ) : (
          <div className="flex flex-col gap-1">
            <Badge variant="outline">
              {earning.platform}{earning.rideType ? ` - ${earning.rideType}` : ""}
            </Badge>
          </div>
        )}
      </TableCell>

      {/* Coluna Desempenho / Descrição */}
      <TableCell>
        {isPromotion ? (
          isEditing && editingRowData ? (
            <input
              type="text"
              className="w-full rounded border border-gray-300 p-1 text-sm bg-gray-700 text-white"
              value={editingRowData.description || ""}
              onChange={(e) =>
                setEditingRowData({ ...editingRowData, description: e.target.value })
              }
              placeholder="Editar descrição"
            />
          ) : (
            <span>{earning.description || "Sem descrição"}</span>
          )
        ) : (
          isEditing && editingRowData ? (
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
          ) : (
            <Desempenho
              amount={earning.amount}
              mileage={earning.mileage}
              duration={earning.duration}
            />
          )
        )}
      </TableCell>

      {/* Coluna Ações */}
      <TableCell className="flex gap-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleSave} title="Salvar edição">
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={onCancelEdit} title="Cancelar">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onEdit(earning)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const d = earning.date;
                const dateObj = d && d.seconds ? new Date(d.seconds * 1000) : new Date(d);
                onDelete(earning.id, dateObj);
              }}
              title="Deletar"
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
