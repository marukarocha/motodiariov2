import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Pencil, Save, X } from "lucide-react";
import { calculateMaintenanceStatus } from "@/app/maintenance/maintenanceCalculator";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { iconsMap } from "@/app/maintenance/iconsMap";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceTypeFlat {
  id: string;
  label: string;
  icon: string;
  color: string;
  number: number;
  category: string;
  description: string;
  maintenanceInterval: number;
}

interface ListMaintenanceProps {
  manutencoes: any[];
  lastMileage: number;
  bikeConfig: any | null;
  handleEdit: (id: string, updated: any) => Promise<void>;
  handleDelete: (id: string) => void;
  maintenanceTypes: MaintenanceTypeFlat[];
}

export default function ListMaintenance({
  manutencoes,
  lastMileage,
  bikeConfig,
  handleEdit,
  handleDelete,
  maintenanceTypes,
}: ListMaintenanceProps) {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});

  const filteredManutencoes = filterType
    ? manutencoes.filter(
        (m) =>
          typeof m.tipo === "string" &&
          m.tipo.toLowerCase() === filterType.toLowerCase()
      )
    : manutencoes;

  const handleInputChange = (field: string, value: any) => {
    setEditingData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (id: string) => {
    try {
      await handleEdit(id, editingData);
      toast({
        title: "Atualizado com sucesso!",
        description: "A manutenção foi salva.",
        variant: "success",
      });
      setEditingId(null);
      setEditingData({});
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar a manutenção.",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
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
                <option key={`filter-${type.id}`} value={type.label.toLowerCase()}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <Input placeholder="Buscar..." className="max-w-xs" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
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
            {filteredManutencoes.map((m, idx) => {
              const isEditing = editingId === m.id;
              const displayDate =
                m.timestamp && typeof m.timestamp.toDate === "function"
                  ? m.timestamp.toDate().toLocaleString("pt-BR")
                  : `${m.data ?? "--"} ${m.hora ?? ""}`;

              // Busca o tipo de manutenção correspondente
              const maintenanceType = maintenanceTypes.find(
                (t) =>
                  typeof t.label === "string" &&
                  typeof m.tipo === "string" &&
                  t.label.toLowerCase() === m.tipo.toLowerCase()
              );
              const IconComponent = maintenanceType
                ? iconsMap[maintenanceType.icon]
                : null;
              const displayColor = maintenanceType?.color || "gray";
              const displayNumber = maintenanceType?.number || "?";
              const displayCategory = maintenanceType?.category || "-";

              const interval =
                maintenanceType?.maintenanceInterval ||
                bikeConfig?.maintenanceIntervals?.[m.tipo?.toLowerCase?.()] ||
                0;
              const nextMaintenance = Number(m.km) + interval;
              const currentMileage = lastMileage || Number(m.km);
              const { text: statusText, color: statusColor } =
                calculateMaintenanceStatus(currentMileage, nextMaintenance);

              return (
                <TableRow key={m.id || idx}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {IconComponent && (
                        <Tooltip>
                          <TooltipTrigger>
                            <IconComponent className="h-5 w-5" />
                          </TooltipTrigger>
                          <TooltipContent>{m.tipo}</TooltipContent>
                        </Tooltip>
                      )}
                      <span
                        className="text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center"
                        style={{ backgroundColor: displayColor }}
                        title={displayCategory}
                      >
                        {displayNumber}
                      </span>
                      {isEditing ? (
                        <select
                          value={editingData.tipo || m.tipo || ""}
                          onChange={(e) => handleInputChange("tipo", e.target.value)}
                          className="border rounded p-1"
                        >
                          <option value="" disabled>
                            Selecione...
                          </option>
                          {maintenanceTypes.map((type) => (
                            <option
                              key={`edit-${type.id}`}
                              value={type.label.toLowerCase()}
                            >
                              {type.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{m.tipo || "Tipo indefinido"}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {maintenanceType ? (
                      <span className="font-semibold" style={{ color: displayColor }}>
                        {displayCategory}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{displayDate}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editingData.km || m.km}
                        onChange={(e) => handleInputChange("km", e.target.value)}
                      />
                    ) : (
                      m.km
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editingData.valor || m.valor}
                        onChange={(e) => handleInputChange("valor", e.target.value)}
                      />
                    ) : (
                      `R$ ${m.valor}`
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editingData.local || m.local}
                        onChange={(e) => handleInputChange("local", e.target.value)}
                      />
                    ) : (
                      m.local
                    )}
                  </TableCell>
                  <TableCell>{nextMaintenance} km</TableCell>
                  <TableCell style={{ color: statusColor }}>{statusText}</TableCell>
                  <TableCell className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSave(m.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(null);
                            setEditingData({});
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(m.id);
                            setEditingData(m);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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
