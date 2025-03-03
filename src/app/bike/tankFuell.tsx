'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { registerBike, getBikeData } from '@/lib/db/firebaseServices';
import { useToast } from '@/hooks/use-toast';

function toNumber(val: unknown) {
  if (typeof val === 'string') {
    const numeric = val.replace(/[^\d]/g, '');
    return numeric ? Number(numeric) : 0;
  }
  return val;
}

const fuelSchema = z.object({
  tankVolume: z.preprocess(toNumber, z.number().min(0, { message: 'Volume inválido' })),
  averageConsumption: z.preprocess(toNumber, z.number().min(0, { message: 'Consumo inválido' })),
});

type FuelData = z.infer<typeof fuelSchema>;

const defaultFuelValues: FuelData = {
  tankVolume: 0,
  averageConsumption: 0,
};

export default function TankFuellingPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { control, handleSubmit, reset } = useForm<FuelData>({
    resolver: zodResolver(fuelSchema),
    defaultValues: defaultFuelValues,
  });

  // Carrega os dados salvos e preenche os campos, se disponíveis
  useEffect(() => {
    async function fetchFuelData() {
      if (!currentUser) return;
      try {
        const data = await getBikeData(currentUser.uid);
        if (data) {
          const fuelData: FuelData = {
            tankVolume: data.tankVolume ? Number(data.tankVolume) : 0,
            averageConsumption: data.averageConsumption ? Number(data.averageConsumption) : 0,
          };
          reset(fuelData);
        }
      } catch (err) {
        console.error("Erro ao buscar dados de combustível:", err);
      }
    }
    fetchFuelData();
  }, [currentUser, reset]);

  async function onSubmit(data: FuelData) {
    try {
      if (!currentUser) throw new Error("Usuário não autenticado");
      // Atualiza os dados de combustível (merge = true)
      await registerBike(currentUser.uid, data);
      toast({
        title: "Sucesso!",
        description: "Dados de combustível atualizados.",
        className: "bg-green-500 text-white",
      });
    } catch (err) {
      console.error("Erro ao atualizar combustível:", err);
      toast({
        title: "Erro!",
        description: "Não foi possível atualizar os dados de combustível.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="mb-4 p-4">
      <CardContent>
        <h2 className="text-2xl font-bold mb-4">Combustível</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="tankVolume"
            render={({ field, fieldState: { error } }) => (
              <div>
                <label className="block mb-1">Capacidade do Tanque (L)</label>
                <Input {...field} placeholder="Digite a capacidade do tanque" />
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
              </div>
            )}
          />
          <Controller
            control={control}
            name="averageConsumption"
            render={({ field, fieldState: { error } }) => (
              <div>
                <label className="block mb-1">Consumo Médio (km/L)</label>
                <Input {...field} placeholder="Digite o consumo médio" />
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
              </div>
            )}
          />
          <Button type="submit" className="mt-4">
            Atualizar Combustível
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
