// src/app/fuelings/components/FuelingsSummary.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Droplet, Calculator, List, Battery } from 'lucide-react';
import { useFuelingsSummary } from '@/hooks/useFuelingsSummary';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { getBikeData, getLastOdometerRecord } from '@/lib/db/firebaseServices';
import { useToast } from '@/hooks/use-toast';
import FuelSummaryCard from './FuelSummaryCard';
import { Fueling } from '@/types/types';

interface FuelingsSummaryProps {
  fuelings: Fueling[];
}

export function FuelingsSummary({ fuelings }: FuelingsSummaryProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [bikeConfig, setBikeConfig] = useState<{ tankVolume: number; averageConsumption: number } | null>(null);
  const [lastOdometer, setLastOdometer] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const config = await getBikeData(currentUser.uid);
        if (config) {
          setBikeConfig({
            tankVolume: Number(config.tankVolume),
            averageConsumption: Number(config.averageConsumption),
          });
        }
      } catch {
        toast({ title: 'Erro', description: 'Não foi possível obter configurações da bike.', variant: 'destructive' });
      }

      try {
        const record = await getLastOdometerRecord(currentUser.uid);
        if (record) {
          setLastOdometer(record.currentMileage);
        }
      } catch {
        console.error('Erro ao buscar odômetro');
      }
    })();
  }, [currentUser, toast]);

  // Calcula dados agregados usando o hook
  const {
    totalCost,
    totalLiters,
    averageCostPerLiter,
    totalFuelings,
    averageConsumption,
    fuelAvailable,
    kilometersRemaining,
  } = useFuelingsSummary(
    fuelings,
    bikeConfig || undefined,
    lastOdometer || undefined
  );

  return (
    <div className="space-y-4">
      {/* Combustível Disponível */}
      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Combustível Disponível</CardTitle>
          <Battery className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {bikeConfig != null && lastOdometer != null ? (
            <FuelSummaryCard
              fuelings={fuelings}
              fuelAvailable={fuelAvailable}
              tankVolume={bikeConfig.tankVolume}
              kilometersRemaining={kilometersRemaining}
            />
          ) : (
            <div className="text-center py-4">Carregando...</div>
          )}
        </CardContent>
      </Card>

      {/* Grid de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Litros</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLiters.toFixed(2)} L</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média de Consumo</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageConsumption > 0 ? `${averageConsumption.toFixed(2)} km/L` : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Abastecimentos</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFuelings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Autonomia Total</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bikeConfig != null ? (bikeConfig.tankVolume * bikeConfig.averageConsumption).toFixed(0) : 'N/A'}{' '}km
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Exporta apenas nomeado
export { FuelingsSummary };
