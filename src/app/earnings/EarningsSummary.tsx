"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/USER/Auth/AuthContext";

interface Earning {
  id: string;
  amount: number;
  date: any;
  duration?: number; // duração em minutos
}

interface EarningsSummaryProps {
  earningsData: Earning[];
  startDate?: Date | null;
  endDate?: Date | null;
}

// Função auxiliar para converter uma data para string no formato "YYYY-MM-DD"
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  // Usa o horário local (meses de 0 a 11)
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Função para formatar o total de horas em "Xh Ym"
function formatHours(totalHours: number): string {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
}

export function EarningsSummary({ earningsData, startDate, endDate }: EarningsSummaryProps) {
  const { currentUser } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [averageEarningsPerHour, setAverageEarningsPerHour] = useState<number>(0);
  const [averageEarningsPerDay, setAverageEarningsPerDay] = useState<number>(0);
  const [offlineDays, setOfflineDays] = useState<number>(0);

  // Calcula o total de horas a partir dos ganhos filtrados (convertendo duration de minutos para horas)
  useEffect(() => {
    let hoursSum = 0;
    if (Array.isArray(earningsData)) {
      earningsData.forEach((earning) => {
        const durationValue = earning.duration != null ? Number(earning.duration) : 0;
        const minutes = isNaN(durationValue) ? 0 : durationValue;
        hoursSum += minutes / 60;
      });
    }
    setTotalHours(hoursSum);
  }, [earningsData]);

  // Calcula o total de ganhos, média por hora e média por dia (apenas nos dias com registros)
  useEffect(() => {
    if (earningsData.length > 0) {
      const total = earningsData.reduce((acc, curr) => acc + curr.amount, 0);
      setTotalEarnings(total);
      setAverageEarningsPerHour(totalHours > 0 ? total / totalHours : 0);

      const uniqueDays = new Set(
        earningsData.map((earning) => {
          let dateObj;
          if (earning.date && earning.date.seconds) {
            dateObj = new Date(earning.date.seconds * 1000);
          } else if (earning.date instanceof Date) {
            dateObj = earning.date;
          } else {
            dateObj = new Date();
          }
          return getLocalDateString(dateObj);
        })
      );
      setAverageEarningsPerDay(uniqueDays.size ? total / uniqueDays.size : 0);
    } else {
      setTotalEarnings(0);
      setAverageEarningsPerHour(0);
      setAverageEarningsPerDay(0);
    }
  }, [earningsData, totalHours]);

  // Calcula os dias offline (dias do período filtrado sem nenhum registro)
  useEffect(() => {
    if (startDate && endDate) {
      // Converte as datas para o formato "YYYY-MM-DD"
      const startStr = getLocalDateString(startDate);
      const endStr = getLocalDateString(endDate);
      
      // Cria um Set com as datas dos registros
      const recordDays = new Set(
        earningsData.map((earning) => {
          let dateObj;
          if (earning.date && earning.date.seconds) {
            dateObj = new Date(earning.date.seconds * 1000);
          } else if (earning.date instanceof Date) {
            dateObj = earning.date;
          } else {
            dateObj = new Date();
          }
          return getLocalDateString(dateObj);
        })
      );

      // Itera do startDate ao endDate para contar os dias offline
      let countOffline = 0;
      const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateCopy = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      while (current <= endDateCopy) {
        const dayStr = getLocalDateString(current);
        if (!recordDays.has(dayStr)) {
          countOffline++;
        }
        // Avança para o próximo dia
        current.setDate(current.getDate() + 1);
      }
      setOfflineDays(countOffline);
    } else {
      setOfflineDays(0);
    }
  }, [earningsData, startDate, endDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {totalEarnings.toFixed(2)}</div>
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
          <div className="text-sm text-muted-foreground">Total de Horas: {formatHours(totalHours)}</div>
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
          <div className="mt-4">
            <Link href="/earnings/daily" className="text-sm font-medium text-primary hover:underline">
              Ver detalhes &rarr;
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dias Offline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{offlineDays} dia{offlineDays !== 1 ? "s" : ""}</div>
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
