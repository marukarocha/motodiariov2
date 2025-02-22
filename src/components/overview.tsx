'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, Car } from "lucide-react";
import { calculateTotalEarnings, calculateTotalFuelings, calculateTotalKilometers, calculateTotalHours } from "@/components/home/utils";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useState, useEffect } from "react";
import WeatherCard from "@/components/home/WeatherCard";

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
  const [totalFuelings, setTotalFuelings] = useState<number | null>(null);
  const [totalKilometers, setTotalKilometers] = useState<number | null>(null);
  const [totalHours, setTotalHours] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Overview: fetchData - Iniciando para usuário:', currentUser?.uid);
      if (currentUser && currentUser.uid && earnings) {
        const uid = currentUser.uid;
        try {
          const earningsTotal = await calculateTotalEarnings(uid);
          console.log('Overview: fetchData - Total de ganhos:', earningsTotal);
          const fuelings = await calculateTotalFuelings(uid);
          console.log('Overview: fetchData - Total de abastecimentos:', fuelings);
          const kilometers = await calculateTotalKilometers(uid);
          console.log('Overview: fetchData - Total de quilômetros:', kilometers);
          const hours = await calculateTotalHours(uid);
          console.log('Overview: fetchData - Total de horas:', hours);

          setTotalEarnings(earningsTotal);
          setTotalFuelings(fuelings);
          setTotalKilometers(kilometers);
          setTotalHours(hours);
        } catch (error) {
          console.error('Overview: fetchData - Erro ao buscar dados:', error);
        }
      } else {
        console.log('Overview: fetchData - currentUser ou currentUser.uid é null ou undefined, ou earnings é null.');
      }
      console.log('Overview: fetchData - Concluído.');
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
