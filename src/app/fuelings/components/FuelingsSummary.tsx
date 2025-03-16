"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Droplet, Calculator, List, Battery } from "lucide-react";
import { useFuelingsSummary } from "@/hooks/useFuelingsSummary";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { getBikeData, getLastOdometerRecord } from "@/lib/db/firebaseServices";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface Fueling {
  litros: number | string;
  valorLitro: number | string;
  currentMileage?: number;
}

interface FuelingsSummaryProps {
  fuelings: Fueling[];
}

export function FuelingsSummary({ fuelings }: FuelingsSummaryProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [bikeConfig, setBikeConfig] = useState<{ tankVolume: number; averageConsumption: number } | null>(null);
  const [lastOdometer, setLastOdometer] = useState<number>(0);

  useEffect(() => {
    async function fetchBikeConfig() {
      if (!currentUser) return;
      try {
        const config = await getBikeData(currentUser.uid);
        if (config) {
          setBikeConfig({
            tankVolume: Number(config.tankVolume),
            averageConsumption: Number(config.averageConsumption),
          });
        }
      } catch (error) {
        console.error("Erro ao buscar configuração da bike:", error);
        toast({
          title: "Erro",
          description: "Erro ao buscar configuração da bike.",
          variant: "destructive",
        });
      }
    }
    async function fetchLastOdometer() {
      if (!currentUser) return;
      try {
        const lastRecord = await getLastOdometerRecord(currentUser.uid);
        if (lastRecord) {
          setLastOdometer(lastRecord.currentMileage);
        }
      } catch (error) {
        console.error("Erro ao buscar odômetro:", error);
      }
    }
    fetchBikeConfig();
    fetchLastOdometer();
  }, [currentUser, toast]);

  // Passa os dados extras para o hook
  const { totalCost, totalLiters, averageCostPerLiter, totalFuelings, fuelAvailable, kilometersRemaining } =
    useFuelingsSummary(fuelings, bikeConfig || undefined, lastOdometer);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Litros</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLiters.toFixed(2)} L</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Litro</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {averageCostPerLiter.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Abastecimentos</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFuelings}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Segunda linha: Cards de Autonomia / Combustível Disponível */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autonomia Total</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bikeConfig ? (
              <div className="text-2xl font-bold">
                {(bikeConfig.tankVolume * bikeConfig.averageConsumption).toFixed(0)} km
              </div>
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combustível Disponível</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuelAvailable.toFixed(2)} L</div>
            <div className="text-sm text-muted-foreground">
              Aproximadamente {kilometersRemaining.toFixed(0)} km restantes
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
