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
import { FaExclamationCircle } from 'react-icons/fa';

function toNumber(val: unknown) {
  if (typeof val === 'string') {
    const numeric = val.replace(/[^\d]/g, '');
    return numeric ? Number(numeric) : 0;
  }
  return val;
}

// Define o schema de validação para manutenção
const maintenanceSchema = z.object({
  oilChangeInterval: z.preprocess(
    toNumber,
    z.number().min(500, { message: 'Mínimo de 500 km' }).max(3000, { message: 'Máximo de 3000 km' })
  ),
  relationChangeKm: z.preprocess(
    toNumber,
    z.number().min(1000, { message: 'Mínimo de 1000 km' }).max(10000, { message: 'Máximo de 10000 km' })
  ),
  oilChangeKm: z.preprocess(
    toNumber,
    z.number().min(500, { message: 'Mínimo de 500 km' }).max(5000, { message: 'Máximo de 5000 km' })
  ),
  lubricationKm: z.preprocess(
    toNumber,
    z.number().min(500, { message: 'Mínimo de 500 km' }).max(5000, { message: 'Máximo de 5000 km' })
  ),
  lastMaintenance: z.string().optional(),
});

type MaintenanceData = z.infer<typeof maintenanceSchema>;

const defaultMaintenanceValues: MaintenanceData = {
  oilChangeInterval: 500,
  relationChangeKm: 1000,
  oilChangeKm: 500,
  lubricationKm: 500,
  lastMaintenance: '',
};

// Função genérica para definir a cor do slider
function getSliderColor(value: number, min: number, max: number): string {
  const third = (max - min) / 3;
  if (value <= min + third) return 'green';
  if (value <= min + 2 * third) return 'orange';
  return 'red';
}

export default function MaintenancePage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { control, handleSubmit, reset, watch } = useForm<MaintenanceData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: defaultMaintenanceValues,
  });

  // Carrega os dados salvos de manutenção e atualiza o formulário
  useEffect(() => {
    async function fetchMaintenance() {
      if (!currentUser) return;
      try {
        const data = await getBikeData(currentUser.uid);
        if (data) {
          const maintenanceData: MaintenanceData = {
            oilChangeInterval: data.oilChangeInterval ? Number(data.oilChangeInterval) : defaultMaintenanceValues.oilChangeInterval,
            relationChangeKm: data.relationChangeKm ? Number(data.relationChangeKm) : defaultMaintenanceValues.relationChangeKm,
            oilChangeKm: data.oilChangeKm ? Number(data.oilChangeKm) : defaultMaintenanceValues.oilChangeKm,
            lubricationKm: data.lubricationKm ? Number(data.lubricationKm) : defaultMaintenanceValues.lubricationKm,
            lastMaintenance: data.lastMaintenance || '',
          };
          reset(maintenanceData);
        }
      } catch (err) {
        console.error("Erro ao buscar dados de manutenção:", err);
      }
    }
    fetchMaintenance();
  }, [currentUser, reset]);

  async function onSubmit(data: MaintenanceData) {
    try {
      if (!currentUser) throw new Error("Usuário não autenticado");
      // Atualiza os dados de manutenção (merge = true)
      await registerBike(currentUser.uid, data);
      toast({
        title: "Sucesso!",
        description: "Dados de manutenção atualizados.",
        className: "bg-green-500 text-white",
      });
    } catch (err) {
      console.error("Erro ao atualizar manutenção:", err);
      toast({
        title: "Erro!",
        description: "Não foi possível atualizar os dados de manutenção.",
        variant: "destructive",
      });
    }
  }

  // Obter valores atuais para exibição de cores
  const oilChangeIntervalVal = watch('oilChangeInterval');
  const relationChangeKmVal = watch('relationChangeKm');
  const oilChangeKmVal = watch('oilChangeKm');
  const lubricationKmVal = watch('lubricationKm');

  return (
    <Card className="mb-4 p-4">
      <CardContent>
        <h2 className="text-2xl font-bold mb-4">Manutenção</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Slider para Intervalo de Troca de Óleo */}
          <Controller
            control={control}
            name="oilChangeInterval"
            render={({ field, fieldState: { error } }) => (
              <div>
                <label className="block mb-1">
                  Intervalo para troca de óleo (km): <span className="font-bold">{field.value} km</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={500}
                    max={3000}
                    step={100}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <FaExclamationCircle size={24} color={getSliderColor(field.value, 500, 3000)} />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
              </div>
            )}
          />

          {/* Slider para Quilometragem para troca (Relação) */}
          <Controller
            control={control}
            name="relationChangeKm"
            render={({ field, fieldState: { error } }) => (
              <div>
                <label className="block mb-1">
                  Quilometragem para troca (relação): <span className="font-bold">{field.value} km</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={1000}
                    max={10000}
                    step={500}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <FaExclamationCircle size={24} color={getSliderColor(field.value, 1000, 10000)} />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
              </div>
            )}
          />

          {/* Slider para Quilometragem para troca de óleo */}
          <Controller
            control={control}
            name="oilChangeKm"
            render={({ field, fieldState: { error } }) => (
              <div>
                <label className="block mb-1">
                  Quilometragem para troca de óleo: <span className="font-bold">{field.value} km</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={100}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <FaExclamationCircle size={24} color={getSliderColor(field.value, 500, 5000)} />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
              </div>
            )}
          />

          {/* Slider para Quilometragem para lubrificação */}
          <Controller
            control={control}
            name="lubricationKm"
            render={({ field, fieldState: { error } }) => (
              <div>
                <label className="block mb-1">
                  Quilometragem para lubrificação: <span className="font-bold">{field.value} km</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={100}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <FaExclamationCircle size={24} color={getSliderColor(field.value, 500, 5000)} />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
              </div>
            )}
          />

          {/* Input para Última manutenção */}
          <Controller
            control={control}
            name="lastMaintenance"
            render={({ field, fieldState: { error } }) => (
              <div>
                <label className="block mb-1">Última manutenção</label>
                <Input {...field} type="date" />
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
              </div>
            )}
          />

          <Button type="submit" className="mt-4">
            Atualizar Manutenção
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
