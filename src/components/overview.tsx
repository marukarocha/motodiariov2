'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Car } from "lucide-react";
import { calculateTotalEarnings, calculateTotalKilometers, calculateTotalHours } from "@/components/home/utils";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useState, useEffect } from "react";
import WeatherCard from "@/components/home/WeatherCard";
import { useFuelingsSummary } from '@/hooks/useFuelingsSummary';
import { getFuelings } from "@/lib/db/firebaseServices";

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
  const [fuelings, setFuelings] = useState<any[]>([]);

  // Usa o hook para calcular os totais dos abastecimentos
  const { totalFuelings } = useFuelingsSummary(fuelings);

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, [currentUser, earnings]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {totalEarnings?.toFixed(2) || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abastecimentos</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFuelings || 0}</div>
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
  );
}
