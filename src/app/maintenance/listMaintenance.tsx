"use client";

import { useState } from "react";
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
import { calculateMaintenanceStatus } from "@/app/maintenance/maintenanceCalculator";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { iconsMap } from "@/app/maintenance/iconsMap"; // Importando o mapa de ícones

interface ListMaintenanceProps {
  manutencoes: any[];
  lastMileage: number;
  bikeConfig: any | null;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  maintenanceTypes: { id: string; label: string; icon: string }[];
}

export default function ListMaintenance({
  manutencoes,
  lastMileage,
  bikeConfig,
  handleEdit,
  handleDelete,
  maintenanceTypes,
}: ListMaintenanceProps) {
  const [filterType, setFilterType] = useState<string>("");

  const filteredManutencoes = filterType
    ? manutencoes.filter((m) => m.tipo.toLowerCase() === filterType.toLowerCase())
    : manutencoes;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Filtros */}
        <div className="flex items-center justify-between">
          <div>
            <label className="mr-2 font-medium">Filtrar por Tipo:</label>
            <select
              className="border rounded p-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Todos</option>
              {maintenanceTypes.map((type) => (
                <option key={type.id} value={type.label.toLowerCase()}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <Input placeholder="Buscar..." className="max-w-xs" />
        </div>

        {/* Tabela de Manutenções */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>KM</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Próxima Troca</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManutencoes.map((m) => {
              const displayDate =
                m.timestamp && typeof m.timestamp.toDate === "function"
                  ? m.timestamp.toDate().toLocaleString("pt-BR")
                  : `${m.data} ${m.hora}`;

              // Obtendo o intervalo correto da configuração da bike
              const maintenanceIntervals = bikeConfig?.maintenanceIntervals || {};
              const interval = maintenanceIntervals[m.tipo.toLowerCase()] ?? 0;

              // Calculando corretamente a próxima troca
              const nextMaintenance = Number(m.km) + interval;

              const currentMileage = lastMileage || Number(m.km);
              const { text: statusText, color: statusColor } = calculateMaintenanceStatus(currentMileage, nextMaintenance);

              // Obtendo o ícone da API para o tipo de manutenção
              const maintenanceType = maintenanceTypes.find((t) => t.label.toLowerCase() === m.tipo.toLowerCase());
              const IconComponent = maintenanceType ? iconsMap[maintenanceType.icon] : null;

              return (
                <TableRow key={m.id}>
                  <TableCell>
                    {IconComponent ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <IconComponent className="h-5 w-5 text-gray-700" />
                        </TooltipTrigger>
                        <TooltipContent>{m.tipo}</TooltipContent>
                      </Tooltip>
                    ) : (
                      m.tipo
                    )}
                  </TableCell>
                  <TableCell>{displayDate}</TableCell>
                  <TableCell>{m.km}</TableCell>
                  <TableCell>R$ {m.valor}</TableCell>
                  <TableCell>{m.local}</TableCell>
                  <TableCell>{nextMaintenance} km</TableCell>
                  <TableCell style={{ color: statusColor }}>{statusText}</TableCell>
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
      </div>
    </TooltipProvider>
  );
}
