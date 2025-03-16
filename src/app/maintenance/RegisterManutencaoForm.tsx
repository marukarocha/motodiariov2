"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { addMaintenance, addOdometerRecord } from "@/lib/db/firebaseServices";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GiWrench } from "react-icons/gi"; // ícone para manutenção
import { Checkbox } from "@/components/ui/checkbox"; // componente checkbox
import { useToast } from "@/hooks/use-toast";

interface RegisterManutencaoFormProps {
  maintenanceType: string;
  onClose: () => void;
}

export default function RegisterManutencaoForm({ maintenanceType, onClose }: RegisterManutencaoFormProps) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Campos de manutenção
  const [km, setKm] = useState("");
  const [valor, setValor] = useState("");
  const [local, setLocal] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Toggle para definir data/hora customizada
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);
  const [dataManual, setDataManual] = useState("");
  const [horaManual, setHoraManual] = useState("");

  // Função para obter o timestamp: se custom, usa os valores informados; senão, usa a data/hora atual.
  const getTimestamp = (): Date => {
    if (useCustomDateTime && dataManual && horaManual) {
      return new Date(`${dataManual}T${horaManual}:00`);
    }
    return new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!km || !valor || !local) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const kmNumber = Number(km);
    const valorNumber = Number(valor);

    if (isNaN(kmNumber) || isNaN(valorNumber)) {
      toast({
        title: "Valores inválidos",
        description: "Verifique os valores informados.",
        variant: "destructive",
      });
      return;
    }

    // Obtem o timestamp definido (customizado ou do servidor)
    const timestamp = getTimestamp();

    // Monta objeto de manutenção usando o timestamp completo
    const manutencao = {
      tipo: maintenanceType,
      timestamp,  // timestamp completo
      km: kmNumber,
      valor: valorNumber,
      local,
      observacoes,
    };

    try {
      // Registra a manutenção. Supondo que addMaintenance retorne o ID da manutenção.
      const maintenanceId = await addMaintenance(currentUser!.uid, manutencao);

      // Registra o odômetro com o mesmo timestamp customizado
      await addOdometerRecord(currentUser!.uid, {
        currentMileage: kmNumber,
        note: `Manutenção (${maintenanceType}): ${maintenanceId}`,
        source: "maintenance",
        sourceId: maintenanceId,
        recordedAt: timestamp,
      });

      toast({
        title: "Sucesso",
        description: `${maintenanceType} registrada com sucesso!`,
        variant: "success",
      });
      onClose();
      router.push("/maintenance");
    } catch (error) {
      console.error("Erro ao registrar manutenção:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar manutenção. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-4">
      <div className="col-span-2 flex items-center gap-2">
        <GiWrench size={32} className="text-primary" />
        <h2 className="text-xl font-semibold">{maintenanceType}</h2>
      </div>
      
      {/* Coluna 1 */}
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="km">Quilometragem (km):</Label>
          <Input
            type="number"
            id="km"
            placeholder="Ex: 15000"
            value={km}
            onChange={(e) => setKm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="local">Local:</Label>
          <Input
            type="text"
            id="local"
            placeholder="Local da manutenção"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
          />
        </div>
      </div>

      {/* Coluna 2 */}
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="valor">Valor (R$):</Label>
          <Input
            type="number"
            id="valor"
            placeholder="Ex: 250.00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="observacoes">Observações:</Label>
          <Input
            type="text"
            id="observacoes"
            placeholder="Observações (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>
      </div>

      {/* Toggle para definir data/hora customizada */}
      <div className="col-span-2 flex items-center space-x-2">
        <Label className="font-medium">Definir data/hora manualmente?</Label>
        <Checkbox
          checked={useCustomDateTime}
          onCheckedChange={(checked) => setUseCustomDateTime(checked as boolean)}
        />
      </div>

      {useCustomDateTime && (
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataManual">Data:</Label>
            <Input
              type="date"
              id="dataManual"
              value={dataManual}
              onChange={(e) => setDataManual(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="horaManual">Hora:</Label>
            <Input
              type="time"
              id="horaManual"
              value={horaManual}
              onChange={(e) => setHoraManual(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Se não for manual, exibe o timestamp atual */}
      {!useCustomDateTime && (
        <div className="col-span-2">
          <p className="text-sm">
            <strong>Data/Hora do Registro:</strong> {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>
      )}

      <div className="col-span-2">
        <Button type="submit" className="bg-green-500 w-full">
          Registrar {maintenanceType}
        </Button>
      </div>
    </form>
  );
}
