'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getFuelings, deleteFueling } from '@/lib/db/firebaseServices';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { Trash } from "lucide-react";
import { RegisterFuelingButton } from '@/app/fuelings/RegisterFuelingsButton';
import { DateFilter } from '@/components/DataFilter';
import { useToast } from '@/hooks/use-toast';
import { FuelingsSummary } from "@/app/fuelings/FuelingsSummary";

export default function FuelingsPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [fuelingsData, setFuelingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!currentUser) return;
      const data = await getFuelings(currentUser.uid, selectedDate);
      setFuelingsData(data || []);
    } catch (err) {
      console.error("Erro ao carregar abastecimentos:", err);
      setError("Erro ao carregar abastecimentos");
      toast({ title: 'Erro!', description: "Erro ao carregar abastecimentos", variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser, selectedDate]);

  const handleDeleteFueling = async (fuelingId: string) => {
    try {
      await deleteFueling(currentUser.uid, fuelingId);
      setFuelingsData(fuelingsData.filter(f => f.id !== fuelingId));
      toast({ title: 'Abastecimento excluído!', description: 'Excluído com sucesso.' });
    } catch (error) {
      console.error("Erro ao excluir abastecimento:", error);
      toast({ title: 'Erro!', description: 'Erro ao excluir abastecimento.', variant: 'destructive' });
    }
  };

  const formatActions = (fueling) => (
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
            Esta ação excluirá o abastecimento permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteFueling(fueling.id)}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="container mx-auto p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Seus Abastecimentos</h1>
      <RegisterFuelingButton onFuelingAdded={fetchData} />
      <DateFilter onDateSelected={(d) => setSelectedDate(d)} />
      <FuelingsSummary fuelings={fuelingsData} />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Abastecimentos</CardTitle>
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
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Posto</TableHead>
                  <TableHead>Valor por Litro (R$)</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelingsData.map((fueling) => (
                  <TableRow key={fueling.id}>
                    <TableCell>{fueling.data}</TableCell>
                    <TableCell>{fueling.hora}</TableCell>
                    <TableCell>{fueling.litros}</TableCell>
                    <TableCell>{fueling.posto}</TableCell>
                    <TableCell>{fueling.valorLitro}</TableCell>
                    <TableCell>{formatActions(fueling)}</TableCell>
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
