"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

// Função para agrupar ganhos por plataforma (conta o número de corridas)
export function groupByPlatform(earningsData: any[]) {
  const groups: Record<string, { platform: string; count: number }> = {};
  earningsData.forEach((earning) => {
    const platform = earning.platform || "Indefinido";
    if (!groups[platform]) {
      groups[platform] = { platform, count: 0 };
    }
    groups[platform].count += 1;
  });
  return Object.values(groups);
}

// Função para agrupar as horas trabalhadas por dia (converte duração para minutos e depois para horas)
export function groupHoursByDay(earningsData: any[]) {
  // Supondo que o campo duration venha como string (ex.: "15 min") ou número (minutos)
  const durationMapping: Record<string, number> = {
    "15 min": 15,
    "30 min": 30,
    "45 min": 45,
    "1 hora": 60,
    "1h 30min": 90,
    "2 horas": 120,
    "3 horas ou mais": 180,
  };

  const groups: Record<string, { day: string; totalMinutes: number }> = {};
  earningsData.forEach((earning) => {
    let minutes = 0;
    if (typeof earning.duration === "string") {
      minutes = durationMapping[earning.duration] || 0;
    } else if (typeof earning.duration === "number") {
      minutes = earning.duration;
    }
    let day = "Indefinido";
    if (earning.date) {
      let d;
      if (earning.date.seconds) {
        d = new Date(earning.date.seconds * 1000);
      } else if (earning.date instanceof Date) {
        d = earning.date;
      }
      if (d) day = d.toISOString().split("T")[0];
    }
    if (!groups[day]) {
      groups[day] = { day, totalMinutes: 0 };
    }
    groups[day].totalMinutes += minutes;
  });
  return Object.values(groups).map((group) => ({
    day: group.day,
    totalHours: Number((group.totalMinutes / 60).toFixed(2)),
  }));
}

// Primeiro gráfico: Corridas por Plataforma (gráfico de barras horizontal)
export function PlatformBarChart({ earningsData }: { earningsData: any[] }) {
  const data = groupByPlatform(earningsData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Corridas por Plataforma</CardTitle>
        <CardDescription>Distribuição do número de corridas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="platform" tickLine={false} axisLine={false} />
            <RechartsTooltip
              contentStyle={{ backgroundColor: "#333", color: "#fff", border: "none" }}
            />
            <Bar dataKey="count" fill="var(--color-primary)" radius={5} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex items-center gap-2 text-sm">
        <TrendingUp className="h-4 w-4" />
        <span>Dados agregados das plataformas</span>
      </CardFooter>
    </Card>
  );
}

// Segundo gráfico: Horas Trabalhadas por Dia (gráfico de linha)
export function DailyHoursLineChart({ earningsData }: { earningsData: any[] }) {
  const data = groupHoursByDay(earningsData);
  data.sort((a, b) => (a.day > b.day ? 1 : -1));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horas Trabalhadas por Dia</CardTitle>
        <CardDescription>Total de horas agregadas por dia</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis label={{ value: "Horas", angle: -90, position: "insideLeft" }} />
            <RechartsTooltip
              contentStyle={{ backgroundColor: "#333", color: "#fff", border: "none" }}
            />
            <Line type="monotone" dataKey="totalHours" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex items-center gap-2 text-sm">
        <TrendingUp className="h-4 w-4" />
        <span>Horas agregadas por dia</span>
      </CardFooter>
    </Card>
  );
}
