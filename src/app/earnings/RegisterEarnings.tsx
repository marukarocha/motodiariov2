'use client';

import { useState } from 'react';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { addFueling } from '@/lib/db/firebaseServices';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  const [date, setDate] = useState<Date>();
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [km, setKm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!amount || !price || !km) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const amountNumber = parseFloat(amount);
    const priceNumber = parseFloat(price);
    const kmNumber = parseFloat(km);

    if (
      isNaN(amountNumber) ||
      isNaN(priceNumber) ||
      isNaN(kmNumber) ||
      amountNumber <= 0 ||
      priceNumber <= 0 ||
      kmNumber < 0
    ) {
      alert('Valores inválidos. Verifique os dados inseridos.');
      return;
    }

    const fueling = {
      date: date || new Date(),
      amount: amountNumber,
      price: priceNumber,
      km: kmNumber,
    };

    try {
      await addFueling(fueling, currentUser!.uid);
      alert('Abastecimento registrado com sucesso!');
      onClose();
      onFuelingAdded();
      // Limpar campos após submissão
      setDate(undefined);
      setAmount('');
      setPrice('');
      setKm('');
    } catch (error) {
      console.error("Erro ao adicionar abastecimento:", error);
      alert('Erro ao registrar abastecimento. Tente novamente.');
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] bg-[#f8fafc] dark:bg-[#18192A]">
      <DialogHeader className="relative">
        <div
          className="relative inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(/fuelings/topo.jpg)', // Utilize uma imagem apropriada para abastecimentos
            width: '112%',
            marginLeft: '-24px',
            height: '200px',
            marginTop: '-20px',
          }}
        />
        <div className="relative z-10">
          <DialogTitle>Registrar Abastecimento</DialogTitle>
          <DialogDescription>
            Registre os abastecimentos aqui.
          </DialogDescription>
        </div>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="amount">Quantidade (litros):</Label>
            <Input
              type="number"
              id="amount"
              placeholder="Digite a quantidade"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="price">Preço (R$):</Label>
            <Input
              type="number"
              id="price"
              placeholder="Digite o preço"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4">
          <Label htmlFor="km">KM:</Label>
          <Input
            type="number"
            id="km"
            placeholder="Digite os KM"
            value={km}
            onChange={(e) => setKm(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="date">Data:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                {date ? format(date, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button variant="default" type="submit" className="w-full">
            Registrar
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default RegisterFuelings;
