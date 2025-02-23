'use client';

import { useState } from "react";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { addManutencao } from "@/lib/db/firebaseServices";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GiVolcano } from "react-icons/gi"; // Exemplo de ícone para manutenção de óleo
import { Checkbox } from "@/components/ui/checkbox"; // Se tiver um componente checkbox customizado

interface RegisterManutencaoFormProps {
  maintenanceType: string;
  onClose: () => void;
}

export default function RegisterManutencaoForm({ maintenanceType, onClose }: RegisterManutencaoFormProps) {
  const { currentUser } = useAuth();
  const router = useRouter();

  // Campos de manutenção
  const [km, setKm] = useState("");
  const [valor, setValor] = useState("");
  const [local, setLocal] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Data e hora automáticos
  const [autoDateTime] = useState(new Date());
  // Checkbox para entrada manual
  const [manual, setManual] = useState(false);
  // Campos manuais
  const [dataManual, setDataManual] = useState("");
  const [horaManual, setHoraManual] = useState("");

  // Função para obter data/hora final: se manual estiver ativo, usa os valores manuais, senão usa os automáticos
  const getData = () => manual && dataManual ? dataManual : autoDateTime.toLocaleDateString("pt-BR");
  const getHora = () => manual && horaManual ? horaManual : autoDateTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataManual && manual) {
      alert("Preencha a data manual.");
      return;
    }
    if (!horaManual && manual) {
      alert("Preencha a hora manual.");
      return;
    }
    if (!km || !valor || !local) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    const manutencao = {
      tipo: maintenanceType,
      data: getData(),       // Data final (manual ou automática)
      hora: getHora(),       // Hora final (manual ou automática)
      km: Number(km),
      valor: Number(valor),
      local,
      observacoes,
    };

    try {
      await addManutencao(currentUser!.uid, manutencao);
      alert(`${maintenanceType} registrada com sucesso!`);
      onClose();
      router.push("/manutencoes");
    } catch (error) {
      console.error("Erro ao registrar manutenção:", error);
      alert("Erro ao registrar manutenção. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="flex items-center gap-2">
        <GiVolcano size={32} className="text-primary" />
        <h2 className="text-xl font-semibold">{maintenanceType}</h2>
      </div>
      {/* Exibe os campos de data/hora somente se o checkbox de manual estiver ativo */}
      <div className="flex items-center space-x-2">
        <label className="font-medium">Inserir manualmente data/hora?</label>
        <Checkbox
          checked={manual}
          onCheckedChange={(checked) => setManual(checked as boolean)}
        />
      </div>
      {manual && (
        <div className="grid grid-cols-2 gap-4">
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
      {/* Se não estiver manual, exibe os dados automáticos */}
      {!manual && (
        <div>
          <p>
            <strong>Data/Hora automáticos:</strong> {autoDateTime.toLocaleDateString("pt-BR")} às {autoDateTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      )}
      <div>
        <Label htmlFor="km">KM:</Label>
        <Input
          type="number"
          id="km"
          placeholder="Quilometragem no momento"
          value={km}
          onChange={(e) => setKm(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="valor">Valor (R$):</Label>
        <Input
          type="number"
          id="valor"
          placeholder="Valor gasto"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
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
      <Button type="submit">Registrar {maintenanceType}</Button>
    </form>
  );
}
