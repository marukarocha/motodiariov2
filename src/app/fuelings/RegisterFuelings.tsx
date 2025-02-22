'use client';

import { useState } from 'react';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { addEarning } from '@/lib/db/firebaseServices';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface RegisterEarningsProps {
  onClose: () => void;
  onEarningAdded: () => void;
}

function RegisterEarnings({ onClose, onEarningAdded }: RegisterEarningsProps) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Controla se o Dialog está aberto
  const [amount, setAmount] = useState('');
  const [mileage, setMileage] = useState('');
  const [platform, setPlatform] = useState('');
  const [tip, setTip] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>();
  const [hours, setHours] = useState('');
  const [error, setError] = useState('');
  const [showTipInput, setShowTipInput] = useState(false);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [customPlatform, setCustomPlatform] = useState('');

  const platformOptions = [
    { name: 'Uber', color: '#333333' },
    { name: '99', color: '#FF9900' },
    { name: 'Ifood', color: '#EA1D2C' },
    { name: 'Indrive', color: '#3CB371' },
    { name: 'Particular', color: '#696969' },
  ];

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAmount(value);
  };

  const handleMileageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMileage(value);
  };

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setHours(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!amount || !mileage || !platform || !hours) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const amountNumber = parseFloat(amount);
    const mileageNumber = parseFloat(mileage);
    const hoursNumber = parseFloat(hours);

    if (isNaN(amountNumber) || isNaN(mileageNumber) || isNaN(hoursNumber) || amountNumber <= 0 || mileageNumber <= 0 || hoursNumber <= 0) {
      alert('Os valores de ganho, quilometragem e horas devem ser números válidos e maiores que zero.');
      return;
    }

    const selectedPlatform = platform === 'Outra' ? customPlatform : platform;

    const earning = {
      date: date || new Date(),
      amount: amountNumber,
      mileage: mileageNumber,
      platform: selectedPlatform,
      tip: tip ? parseFloat(tip) : 0,
      description,
      hours: hoursNumber,
    };

    try {
      await addEarning(currentUser!.uid, earning);
      alert('Ganho registrado com sucesso!');
      onClose();
      onEarningAdded();
      setAmount('');
      setMileage('');
      setPlatform('');
      setTip('');
      setDescription('');
      setHours('');
      setCustomPlatform('');
      setShowTipInput(false);
      setShowDescriptionInput(false);
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
                width: '112%',         // Largura de 113%
                marginLeft: '-24px',  // Margem esquerda negativa de 24px
                height: '200px',      // Altura de 200px
                marginTop: '-20px',   // Margem superior negativa de 20px
                marginBottom: '0x',   // Margem superior negativa de 20px
              }}
            />
          <div className="relative z-10">
          <DialogTitle>Registrar Ganho</DialogTitle>
          <DialogDescription>
            Registre seus ganhos diários aqui.
          </DialogDescription>
        </div>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="amount">Valor (R$):</Label>
            <Input
              type="number"
              id="amount"
              placeholder="Digite o valor"
              value={amount}
              onChange={handleAmountChange}
            />
          </div>
          <div>
            <Label htmlFor="mileage">KM Rodado:</Label>
            <Input
              type="number"
              id="mileage"
              placeholder="Digite a quilometragem"
              value={mileage}
              onChange={handleMileageChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="hours">Horas:</Label>
            <Input
              type="number"
              id="hours"
              placeholder="Ex: 1.5"
              value={hours}
              onChange={handleHoursChange}
            />
          </div>
          <div>
            <Label htmlFor="platform">Plataforma:</Label>
            <Select onValueChange={(value) => setPlatform(value)} value={platform}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Selecione a plataforma" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((option) => (
                  <SelectItem key={option.name} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
                <SelectItem value="Outra">Outra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {platform === 'Outra' && (
          <div className="mb-4">
            <Label htmlFor="customPlatform">Nome da Plataforma:</Label>
            <Input
              type="text"
              id="customPlatform"
              placeholder="Digite o nome da plataforma"
              value={customPlatform}
              onChange={(e) => setCustomPlatform(e.target.value)}
            />
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
            <Input
              type="number"
              placeholder="Digite o valor da gorjeta"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="mt-2"
            />
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
            <span className="text-sm">Adicionar descrição?</span>
          </label>
          {showDescriptionInput && (
            <div className="mt-2">
              <textarea
                rows={3}
                placeholder="Descrição do ganho"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <Label htmlFor="date">Data:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={
                  cn("w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )
                }
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

export default RegisterEarnings;
