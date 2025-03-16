"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NumericFormat } from "react-number-format";
import { addFueling, addOdometerRecord } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Posto {
  id: string;
  name: string;
  address: string;
  fuelTypes: {
    Gasoline: {
      regular: {
        price: number;
      };
      premium?: {
        price: number;
      };
    };
    Ethanol: {
      price: number;
    };
  };
  rating: number;
  reviewsCount: number;
  lastUpdated: string;
}

interface RegisterFuelingsProps {
  onClose?: () => void;
  onFuelingAdded?: () => void;
}

export default function RegisterFuelings({ onClose, onFuelingAdded }: RegisterFuelingsProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [postos, setPostos] = useState<Posto[]>([]);
  const [selectedPostoId, setSelectedPostoId] = useState("");
  const [selectedFuel, setSelectedFuel] = useState<"Gasoline" | "Ethanol">("Gasoline");
  const [valorLitro, setValorLitro] = useState("");

  // Campos do formulário
  const [litros, setLitros] = useState("");
  const [odometer, setOdometer] = useState("");
  const [postoName, setPostoName] = useState("");

  // Toggle para exibir ou não data/hora custom
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [hora, setHora] = useState("");

  // Carrega os postos da API local (/api/postos)
  useEffect(() => {
    async function fetchPostos() {
      try {
        const res = await fetch("/api/postos");
        const data = await res.json();
        setPostos(data);
      } catch (error) {
        console.error("Erro ao buscar postos:", error);
        toast({
          title: "Erro",
          description: "Erro ao buscar postos.",
          variant: "destructive",
        });
      }
    }
    fetchPostos();
  }, [toast]);

  // Atualiza o valor do combustível e o nome do posto ao selecionar
  useEffect(() => {
    if (selectedPostoId) {
      const posto = postos.find((p) => p.id === selectedPostoId);
      if (posto) {
        if (selectedFuel === "Gasoline") {
          setValorLitro(posto.fuelTypes.Gasoline.regular.price.toString());
        } else {
          setValorLitro(posto.fuelTypes.Ethanol.price.toString());
        }
        setPostoName(posto.name);
      }
    }
  }, [selectedPostoId, selectedFuel, postos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    if (!litros || !odometer || !valorLitro || !selectedPostoId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os campos (posto, litros, odômetro e valor).",
        variant: "destructive",
      });
      return;
    }

    const litrosNumber = parseFloat(litros);
    const valorLitroNumber = parseFloat(valorLitro);
    const odometerNumber = parseFloat(odometer);

    if (isNaN(litrosNumber) || isNaN(valorLitroNumber) || isNaN(odometerNumber)) {
      toast({
        title: "Valores inválidos",
        description: "Verifique os valores informados.",
        variant: "destructive",
      });
      return;
    }

    // Define data/hora: se custom, usa os valores informados; senão, usa a data/hora atual.
    let dataStr = "";
    let horaStr = "";
    let recordedAt: Date; // Para o registro do odômetro

    if (useCustomDateTime) {
      const [yyyy, mm, dd] = selectedDate.split("-");
      dataStr = `${dd}/${mm}/${yyyy}`;
      horaStr = hora || "00:00";
      recordedAt = new Date(`${selectedDate}T${hora}:00`);
    } else {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      dataStr = `${day}/${month}/${year}`;
      horaStr = `${hours}:${minutes}`;
      recordedAt = now;
    }

    console.log("recordedAt:", recordedAt);

    // Monta objeto de abastecimento
    const fuelingData = {
      data: dataStr,
      hora: horaStr,
      litros: litrosNumber,
      posto: postoName,
      valorLitro: valorLitroNumber,
    };

    try {
      // Registra o abastecimento e obtém o fuelingId
      const fuelingId = await addFueling(currentUser.uid, fuelingData);

      // Registra o odômetro com os dados customizados (incluindo recordedAt)
      await addOdometerRecord(currentUser.uid, {
        currentMileage: odometerNumber,
        note: `Abastecimento: ${fuelingId}`,
        source: "fueling",
        sourceId: fuelingId,
        recordedAt, // Usará o valor customizado, se definido
      });

      toast({
        title: "Sucesso",
        description: "Abastecimento e odômetro salvos com sucesso!",
        variant: "success",
      });

      onClose?.();
      onFuelingAdded?.();

      // Limpa os campos
      setSelectedPostoId("");
      setSelectedFuel("Gasoline");
      setValorLitro("");
      setLitros("");
      setOdometer("");
      setSelectedDate("");
      setHora("");
      setUseCustomDateTime(false);
    } catch (error) {
      console.error("Erro ao salvar abastecimento:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar abastecimento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-md w-full max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        {/* Coluna 1 */}
        <div className="flex flex-col gap-4">
          {/* Select do Posto */}
          <div>
            <Label htmlFor="postoSelect">Posto:</Label>
            <select
              id="postoSelect"
              value={selectedPostoId}
              onChange={(e) => setSelectedPostoId(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">Selecione um posto</option>
              {postos.map((posto) => (
                <option key={posto.id} value={posto.id}>
                  {posto.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Combustível */}
          <div>
            <Label htmlFor="fuelSelect">Combustível:</Label>
            <select
              id="fuelSelect"
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value as "Gasoline" | "Ethanol")}
              className="border p-2 rounded w-full"
            >
              <option value="Gasoline">Gasolina</option>
              <option value="Ethanol">Etanol</option>
            </select>
          </div>

          {/* Valor por Litro */}
          <div>
            <Label htmlFor="valorLitro">Valor por Litro (R$):</Label>
            <NumericFormat
              value={valorLitro}
              onValueChange={({ floatValue }) => setValorLitro(floatValue?.toString() || "")}
              decimalScale={2}
              fixedDecimalScale={true}
              prefix="R$ "
              placeholder="Ex: 3,99"
              customInput={Input}
              className="w-full"
              thousandSeparator="."
              decimalSeparator=","
            />
          </div>
        </div>

        {/* Coluna 2 */}
        <div className="flex flex-col gap-4">
          {/* Litros */}
          <div>
            <Label htmlFor="litros">Litros:</Label>
            <NumericFormat
              value={litros}
              onValueChange={({ floatValue }) => setLitros(floatValue?.toString() || "")}
              decimalScale={1}
              fixedDecimalScale={true}
              placeholder="Ex: 15,5"
              customInput={Input}
              className="w-full"
              thousandSeparator="."
              decimalSeparator=","
            />
          </div>

          {/* Odômetro */}
          <div>
            <Label htmlFor="odometer">Odômetro (km):</Label>
            <NumericFormat
              value={odometer}
              onValueChange={({ floatValue }) => setOdometer(floatValue?.toString() || "")}
              decimalScale={0}
              placeholder="Ex: 12345"
              customInput={Input}
              className="w-full"
              thousandSeparator=""  // Não utiliza separador para valores inteiros
            />
          </div>

          {/* Botão para alternar uso de data/hora custom */}
          <div className="mt-7">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUseCustomDateTime(!useCustomDateTime)}
              className={useCustomDateTime ? "bg-blue-500 text-white" : ""}
            >
              {useCustomDateTime ? "Usar data/hora automática" : "Definir data/hora"}
            </Button>
          </div>
        </div>
      </div>

      {/* Se o usuário optar por data/hora custom, exibe abaixo */}
      {useCustomDateTime && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="dataInput">Data:</Label>
            <Input
              type="date"
              id="dataInput"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="horaInput">Hora:</Label>
            <Input
              type="time"
              id="horaInput"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </div>
        </div>
      )}

      <Button type="submit" className="bg-green-500 mt-6 w-full">
        Registrar Abastecimento
      </Button>
    </form>
  );
}
