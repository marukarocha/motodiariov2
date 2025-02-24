'use client';

import { useState } from 'react';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { addEarning } from '@/lib/db/firebaseServices';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RegisterEarningsProps {
  onClose: () => void;
  onEarningAdded: () => void;
}

function RegisterEarnings({ onClose, onEarningAdded }: RegisterEarningsProps) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [mileage, setMileage] = useState('');
  const [platform, setPlatform] = useState('');
  const [tip, setTip] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [rideType, setRideType] = useState('');
  const [useManualDate, setUseManualDate] = useState(false);
  const [showTipInput, setShowTipInput] = useState(false);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);

  const platformOptions = ['Uber', '99', 'Ifood', 'Indrive', 'Particular'];
  const rideTypeOptions = ['Passageiro', 'Entrega', 'Compras', 'Comida'];
  const durationOptions = ['15 min', '30 min', '45 min', '1 hora', '1h 30min', '2 horas', '3 horas ou mais'];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!amount || !mileage || !platform || !duration || !rideType) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const earning = {
      date: useManualDate && date ? date : new Date(),
      time: useManualDate && time ? time : format(new Date(), 'HH:mm'),
      amount: parseFloat(amount),
      mileage: parseFloat(mileage),
      platform,
      rideType,
      duration,
      tip: tip ? parseFloat(tip) : 0,
      description,
    };

    try {
      await addEarning(currentUser!.uid, earning);
      alert('Ganho registrado com sucesso!');
      onClose();
      onEarningAdded();
    } catch (error) {
      console.error("Erro ao adicionar ganho:", error);
      alert('Erro ao registrar ganho. Tente novamente.');
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] bg-[#f8fafc] dark:bg-[#18192A]">
      <DialogHeader className="relative">
        <div
          className="relative inset-0 bg-cover bg-center z-0 "
          style={{
            backgroundImage: 'url(/earnings/topo.jpg)',
            width: '112%',
            marginLeft: '-24px',
            height: '200px',
            marginTop: '-20px',
          }}
        />
        <div className="relative z-10">
          <DialogTitle>Registrar Ganho</DialogTitle>
          <DialogDescription>Registre seus ganhos diários aqui.</DialogDescription>
        </div>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Valor (R$)</Label>
            <Input type="number" placeholder="Digite o valor" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>KM Rodado</Label>
            <Input type="number" placeholder="Digite a quilometragem" value={mileage} onChange={(e) => setMileage(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Duração da Corrida</Label>
            <Select onValueChange={setDuration} value={duration}>
              <SelectTrigger><SelectValue placeholder="Selecione a duração" /></SelectTrigger>
              <SelectContent className='bg-gray-900'>
                {durationOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Plataforma</Label>
            <Select onValueChange={setPlatform} value={platform}>
              <SelectTrigger><SelectValue placeholder="Selecione a plataforma" /></SelectTrigger>
              <SelectContent className='bg-gray-900'>
                {platformOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <Label>Tipo de Corrida</Label>
          <Select onValueChange={setRideType} value={rideType}>
            <SelectTrigger><SelectValue placeholder="Selecione o tipo de corrida" /></SelectTrigger>
            <SelectContent className='bg-gray-900'>
              {rideTypeOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4"
              checked={useManualDate}
              onChange={(e) => setUseManualDate(e.target.checked)}
            />
            <span className="text-sm">Definir data e hora manualmente?</span>
          </label>
        </div>

        {useManualDate && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {date ? format(date, 'PPP', { locale: ptBR }) : 'Escolha uma data'}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Hora</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4"
              checked={showTipInput}
              onChange={(e) => setShowTipInput(e.target.checked)}
            />
            <span className="text-sm">Recebeu gorjeta?</span>
          </label>
          {showTipInput && (
            <Input type="number" placeholder="Digite o valor da gorjeta" value={tip} onChange={(e) => setTip(e.target.value)} className="mt-2" />
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4"
              checked={showDescriptionInput}
              onChange={(e) => setShowDescriptionInput(e.target.checked)}
            />
            <span className="text-sm">Adicionar anotações?</span>
          </label>
          {showDescriptionInput && (
            <textarea rows={3} placeholder="Digite sua anotação" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md mt-2" />
          )}
        </div>
          
          </div>
        <DialogFooter>
          <Button type="submit" className="w-full bg-green-600">Registrar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default RegisterEarnings;
