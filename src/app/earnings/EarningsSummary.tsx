'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Earning } from "@/app/earnings/components/EarningsTable";

interface EarningsSummaryProps {
  earningsData: Earning[];
}

export function EarningsSummary({ earningsData }: EarningsSummaryProps) {
  // Calcula o total de ganhos
  const totalEarnings = earningsData.reduce((acc, curr) => acc + curr.amount, 0);

  // Mapeamento para converter duração em horas
  const durationToHours: Record<string, number> = {
    "15 min": 0.25,
    "30 min": 0.5,
    "45 min": 0.75,
    "1 hora": 1,
    "1h 30min": 1.5,
    "2 horas": 2,
    "3 horas ou mais": 3,
  };

  // Calcula o total de horas somando as durações dos ganhos
  const totalHours = earningsData.reduce((acc, earning) => {
    const hours = earning.duration ? durationToHours[earning.duration] || 0 : 0;
    return acc + hours;
  }, 0);
  const averageEarningsPerHour = totalHours > 0 ? totalEarnings / totalHours : 0;

  // Calcula a média de ganhos por dia
  const distinctDays = new Set(
    earningsData.map((earning) => {
      let dateObj;
      if (earning.date && earning.date.seconds) {
        dateObj = new Date(earning.date.seconds * 1000);
      } else if (earning.date instanceof Date) {
        dateObj = earning.date;
      } else {
        dateObj = new Date();
      }
      return dateObj.toISOString().split("T")[0];
    })
  );
  const averageEarningsPerDay = distinctDays.size ? totalEarnings / distinctDays.size : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {totalEarnings.toFixed(2)}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">Badge 1</Badge>
            <Badge variant="secondary">Badge 2</Badge>
          </div>
          <div className="mt-4">
            <Link href="/earnings/details" className="text-sm font-medium text-primary hover:underline">
              Ver detalhes &rarr;
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média de Ganho por Hora</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {averageEarningsPerHour.toFixed(2)}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">Badge 1</Badge>
            <Badge variant="secondary">Badge 2</Badge>
          </div>
          <div className="mt-4">
            <Link href="/earnings/hourly" className="text-sm font-medium text-primary hover:underline">
              Ver detalhes &rarr;
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média de Ganho por Dia</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {averageEarningsPerDay.toFixed(2)}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">Badge 1</Badge>
            <Badge variant="secondary">Badge 2</Badge>
          </div>
          <div className="mt-4">
            <Link href="/earnings/daily" className="text-sm font-medium text-primary hover:underline">
              Ver detalhes &rarr;
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
