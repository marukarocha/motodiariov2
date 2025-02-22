// components/Earnings/RegisterEarnings.tsx
import { useState } from 'react';
import { useAuth } from '../USER/Auth/AuthContext';
import { addEarning } from '../../lib/db/firebaseServices';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from '@/lib/utils';

interface RegisterEarningsProps {
  onClose: () => void;
}

function RegisterEarnings({ onClose }: RegisterEarningsProps) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [mileage, setMileage] = useState('');
  const [platform, setPlatform] = useState('');
  const [tip, setTip] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>();
  const [duration, setDuration] = useState('');
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

  const durationOptions = [
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 20, label: '20 min' },
    { value: 25, label: '25 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '60 min' },
    { value: 75, label: '75 min' },
    { value: 90, label: '90 min' },
  ];

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAmount(value);
  };

  const handleMileageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMileage(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!amount || !mileage || !platform || !duration) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const amountNumber = parseFloat(amount);
    const mileageNumber = parseFloat(mileage);
    const durationNumber = parseFloat(duration);

    if (isNaN(amountNumber) || isNaN(mileageNumber) || isNaN(durationNumber) || amountNumber <= 0 || mileageNumber <= 0 || durationNumber <= 0) {
      alert('Os valores de ganho, quilometragem e duração devem ser números válidos e maiores que zero.');
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
      duration: durationNumber,
      hours: durationNumber / 60,
    };

    try {
      await addEarning(currentUser!.uid, earning);
      alert('Ganho registrado com sucesso!');
      onClose();
      setAmount('');
      setMileage('');
      setPlatform('');
      setTip('');
      setDescription('');
      setDuration('');
      setCustomPlatform('');
      setShowTipInput(false);
      setShowDescriptionInput(false);
    } catch (error) {
      console.error("Erro ao adicionar ganho:", error);
      alert('Erro ao registrar ganho. Tente novamente.');
    }
  };

  return (
    <div className="p-3">
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
            <Label htmlFor="duration">Duração (minutos):</Label>
            <Select onValueChange={(value) => setDuration(value)} value={duration}>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        <Button variant="default" type="submit" className="w-full">
          Registrar
        </Button>
      </form>
    </div>
  );
}

export default RegisterEarnings;
