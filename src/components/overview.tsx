// src/app/overview.tsx

'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Car } from "lucide-react";
import { calculateTotalEarnings, calculateTotalKilometers, calculateTotalHours } from "@/components/home/utils";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import WeatherCard from "@/components/home/WeatherCard";
import { useFuelingsSummary } from '@/hooks/useFuelingsSummary';
import { getFuelings, getBikeData, getLastOdometerRecord } from "@/lib/db/firebaseServices";
import FuelSummaryCard from "@/app/fuelings/components/FuelSummaryCard";
import { RegisterFuelingButton } from "@/app/fuelings/components/RegisterFuelingsButton";
import { RegisterEarningButton } from "@/app/earnings/RegisterEarningButton";
import { Fueling } from "@/types/types";

interface Earning {
  id: string;
  amount: number;
  mileage: number;
  platform: string;
  tip?: number;
  description?: string;
  date: any;
  hours?: number;
}

interface OverviewProps {
  earnings: Earning[] | null;
}

export function Overview({ earnings }: OverviewProps) {
  const { currentUser } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [totalKilometers, setTotalKilometers] = useState<number | null>(null);
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [fuelings, setFuelings] = useState<Fueling[]>([]);
  const [bikeConfig, setBikeConfig] = useState<{ tankVolume: number; averageConsumption: number } | null>(null);
  const [lastOdometer, setLastOdometer] = useState<number>(0);

  // Usa o hook para obter dados agregados dos abastecimentos
  const { totalFuelings, fuelAvailable, kilometersRemaining } =
    useFuelingsSummary(fuelings, bikeConfig || undefined, lastOdometer);

  const fetchData = useCallback(async () => {
    if (currentUser && currentUser.uid) {
      const uid = currentUser.uid;
      try {
        const earningsTotal = await calculateTotalEarnings(uid);
        const kilometers = await calculateTotalKilometers(uid);
        const hours = await calculateTotalHours(uid);
        const fuelingsData = await getFuelings(uid);
        setTotalEarnings(earningsTotal);
        setTotalKilometers(kilometers);
        setTotalHours(hours);
        setFuelings(fuelingsData);
      } catch (error) {
        console.error("Overview: fetchData - Erro ao buscar dados:", error);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [currentUser, earnings, fetchData]);

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
  }, [currentUser]);

  return (
    <div className="container mx-auto p-4">
      {/* Exibe o FuelSummaryCard */}
      {bikeConfig && (
        <Card className="mb-4 w-full bg-dark">
         
          <div className="mt-4">
            <FuelSummaryCard
              fuelings={fuelings}
              fuelAvailable={fuelAvailable}
              tankVolume={bikeConfig.tankVolume}
              kilometersRemaining={kilometersRemaining}
            />
          </div>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalEarnings?.toFixed(2) || 0}</div>
            <p className="text-sm">
              Você tem um total de {earnings?.length || 0} ganhos.
            </p>
            <div className="mt-2">
              <RegisterEarningButton onEarningAdded={() => { /* ação de atualização se necessário */ }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abastecimentos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFuelings || 0}</div>
            {/* Botão de registro de abastecimento dentro deste card */}
            <div className="mt-2">
              <RegisterFuelingButton onFuelingAdded={fetchData} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kilômetros Rodados</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKilometers?.toFixed(2) || 0} km</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours?.toFixed(2) || 0} h</div>
          </CardContent>
        </Card>
        <WeatherCard />
      </div>
    </div>
  );
}

export default Overview;
