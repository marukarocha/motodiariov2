'use client';

import { useState } from "react";
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { addFueling } from "@/lib/db/firebaseServices";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RegisterFuelingsProps {
  onClose: () => void;
  onFuelingAdded: () => void;
}

function RegisterFuelings({ onClose, onFuelingAdded }: RegisterFuelingsProps) {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [hora, setHora] = useState(""); // Input para hora (ex: "14:30")
  const [litros, setLitros] = useState("");
  const [posto, setPosto] = useState("");
  const [valorLitro, setValorLitro] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!selectedDate || !hora || !litros || !posto || !valorLitro) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const litrosNumber = parseFloat(litros);
    const valorLitroNumber = parseFloat(valorLitro);

    if (isNaN(litrosNumber) || isNaN(valorLitroNumber) || litrosNumber <= 0 || valorLitroNumber <= 0) {
      alert("Valores inválidos para litros ou valor por litro.");
      return;
    }

    // Converte a data selecionada para string no formato pt-BR
    const dataStr = selectedDate.toLocaleDateString("pt-BR");

    const fuelingData = {
      data: dataStr,        // campo "data" (string)
      hora,                 // campo "hora" (string)
      litros: litrosNumber, // campo "litros" (number)
      posto,                // campo "posto" (string)
      valorLitro: valorLitroNumber, // campo "valorLitro" (number)
    };

    try {
      await addFueling(currentUser!.uid, fuelingData);
      alert("Abastecimento registrado com sucesso!");
      onClose();
      onFuelingAdded();
      // Limpar campos
      setSelectedDate(undefined);
      setHora("");
      setLitros("");
      setPosto("");
      setValorLitro("");
    } catch (error) {
      console.error("Erro ao adicionar abastecimento:", error);
      alert("Erro ao registrar abastecimento. Tente novamente.");
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] bg-[#f8fafc] dark:bg-[#18192A]">
      <DialogHeader className="relative">
        <div
          className="relative inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(/fuelings/topo.jpg)',
            width: '112%',
            marginLeft: '-24px',
            height: '200px',
            marginTop: '-20px',
          }}
        />
        <div className="relative z-10">
          <DialogTitle>Registrar Abastecimento</DialogTitle>
          <DialogDescription>
            Registre os dados do abastecimento.
          </DialogDescription>
        </div>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="data">Data:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  {selectedDate ? selectedDate.toLocaleDateString("pt-BR") : <span>Escolha uma data</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="hora">Hora:</Label>
            <Input
              type="time"
              id="hora"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </div>
        </div>
        {/* Litros e Valor por Litro */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="litros">Litros:</Label>
            <Input
              type="number"
              id="litros"
              placeholder="Ex: 15.5"
              value={litros}
              onChange={(e) => setLitros(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="valorLitro">Valor por Litro (R$):</Label>
            <Input
              type="number"
              id="valorLitro"
              placeholder="Ex: 3.99"
              value={valorLitro}
              onChange={(e) => setValorLitro(e.target.value)}
            />
          </div>
        </div>
        {/* Posto */}
        <div className="mb-4">
          <Label htmlFor="posto">Posto:</Label>
          <Input
            type="text"
            id="posto"
            placeholder="Nome do posto"
            value={posto}
            onChange={(e) => setPosto(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="default" type="submit" className="w-full bg-green-500">
            Registrar
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default RegisterFuelings;
