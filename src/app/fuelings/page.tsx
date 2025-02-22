'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getEarnings, deleteEarning } from '@/lib/db/firebaseServices';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { calculateTotalEarnings, calculateAverageEarningsPerHour, calculateAverageEarningsPerDay } from '@/app/earnings/utils';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { Trash } from "lucide-react";
import { RegisterEarningButton } from '@/app/earnings/RegisterEarningButton';
import { EarningsSummary } from '@/app/earnings/EarningsSummary';
import { DateFilter } from '@/components/DataFilter';
import { useToast } from '@/hooks/use-toast';

interface Earning {
  id: string;
  amount: number;
  mileage: number;
  platform: string;
  tip?: number;
  description?: string;
  date: any; // Keep as 'any' for now, but ideally use a more specific type
  hours?: number;
}

const earningsColumns = [
  { key: 'date', label: 'Data' },
  { key: 'amount', label: 'Valor (R$)' },
  { key: 'mileage', label: 'KM' },
  { key: 'platform', label: 'Plataforma' },
  { key: 'tip', label: 'Gorjeta (R$)' },
  { key: 'description', label: 'Descrição' },
  { key: 'actions', label: 'Ações' },
];

export default function EarningsPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [earningsData, setEarningsData] = useState<Earning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [averageEarningsPerHour, setAverageEarningsPerHour] = useState<number | null>(null);
  const [averageEarningsPerDay, setAverageEarningsPerDay] = useState<number | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  const handleAddEarning = () => {
    fetchData();
  };

  const handleDeleteEarning = async (earningId: string) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado.');
      await deleteEarning(currentUser.uid, earningId);
      setEarningsData(earningsData.filter(earning => earning.id !== earningId));
      toast({ title: 'Ganho excluído!', description: 'O ganho foi excluído com sucesso.' });
    } catch (error) {
      console.error("Erro ao excluir ganho:", error);
      toast({ title: 'Erro!', description: 'Erro ao excluir ganho. Tente novamente.', variant: 'destructive' });
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      const uid = currentUser.uid;
      const data = await getEarnings(uid, selectedStartDate, selectedEndDate);
      setEarningsData(data || []);
      const total = await calculateTotalEarnings(uid, selectedStartDate, selectedEndDate);
      setTotalEarnings(total);
      const averagePerHour = await calculateAverageEarningsPerHour(uid, selectedStartDate, selectedEndDate);
      setAverageEarningsPerHour(averagePerHour);
      const averagePerDay = await calculateAverageEarningsPerDay(uid, selectedStartDate, selectedEndDate);
      setAverageEarningsPerDay(averagePerDay);
    } catch (err: any) {
      console.error("Erro ao carregar ganhos:", err);
      setError(`Erro ao carregar ganhos: ${err.message}`);
      toast({ title: 'Erro!', description: `Erro ao carregar ganhos: ${err.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser, selectedStartDate, selectedEndDate]);

  const handleDateSelected = (startDate: Date | null, endDate: Date | null) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  };

  const formatDate = (date: any): string => {
    if (!date) return 'N/A';
    try {
      // Handle Firestore Timestamps
      if (date.seconds !== undefined && date.nanoseconds !== undefined) {
        return format(new Date(date.seconds * 1000 + date.nanoseconds / 1000000), 'dd/MM/yyyy', { locale: ptBR });
      }
      // Handle Date objects
      else if (date instanceof Date) {
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
      // Handle other cases (log a warning)
      else {
        console.warn('formatDate received an unexpected date format:', date);
        return 'Data inválida';
      }
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatActions = (earning: Earning) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-red-500">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o ganho da sua conta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteEarning(earning.id)}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="container mx-auto p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Seus Ganhos</h1>
      <RegisterEarningButton onEarningAdded={handleAddEarning} />
      <DateFilter onDateSelected={handleDateSelected} />
      <EarningsSummary
        totalEarnings={totalEarnings}
        averageEarningsPerHour={averageEarningsPerHour}
        averageEarningsPerDay={averageEarningsPerDay}
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Ganhos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {earningsColumns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {earningsData.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>{formatDate(earning.date)}</TableCell>
                    <TableCell>R$ {earning.amount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{earning.mileage?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{earning.platform}</TableCell>
                    <TableCell>R$ {earning.tip?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{earning.description || 'N/A'}</TableCell>
                    <TableCell>{formatActions(earning)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
