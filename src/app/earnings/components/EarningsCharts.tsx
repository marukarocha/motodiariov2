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
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

// ====================
// GRÁFICO 1: PlatformBarChart
// ====================

// Agrupa os ganhos por plataforma (conta o número de corridas)
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
            <YAxis
              type="category"
              dataKey="platform"
              tickLine={false}
              axisLine={false}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "#333",
                color: "#fff",
                border: "none",
              }}
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

// ====================
// GRÁFICO 2: DailyHoursLineChart
// ====================

// Agrupa as horas trabalhadas por dia
export function groupHoursByDay(earningsData: any[]) {
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
      if (d) {
        const dayStr = String(d.getDate()).padStart(2, "0");
        const monthStr = String(d.getMonth() + 1).padStart(2, "0");
        // Formata no formato "DD/MM" (sem o ano)
        day = `${dayStr}/${monthStr}`;
      }
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

// Função auxiliar para formatar um número de horas no formato "XhYmin"
function formatHours(totalHours: number): string {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return `${hours}h${minutes}min`;
}

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
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis
              label={{ value: "Horas", angle: -90, position: "insideLeft" }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="totalHours"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
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

// Custom tooltip para o gráfico de linha de horas trabalhadas
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#333",
          color: "#fff",
          padding: "8px",
          borderRadius: "4px",
        }}
      >
        <p>{`Dia: ${label}`}</p>
        <p>{`Horas: ${formatHours(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

// ====================
// GRÁFICO 3: PlatformStackedBarChart
// ====================

// Interface para permitir chaves dinâmicas para os ride types
interface RideGroup {
  platformName: string;
  [rideType: string]: number | string;
}

// Agrupa os registros por plataforma e, para cada plataforma, agrupa dinamicamente os ride types
export function groupByPlatformAndRideType(earningsData: any[]) {
  const groups: Record<string, RideGroup> = {};
  earningsData.forEach((earning) => {
    const platform = earning.platform || "Indefinido";
    if (!groups[platform]) {
      groups[platform] = { platformName: platform };
    }
    // Converte rideType para string, remove espaços extras e usa "Indefinido" se ausente
    const rideType = earning.rideType ? String(earning.rideType).trim() : "Indefinido";
    groups[platform][rideType] = ((groups[platform][rideType] as number) || 0) + 1;
  });
  return Object.values(groups);
}

// Custom tooltip para o gráfico de barras empilhadas
const CustomStackedTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 rounded">
        <p className="font-bold">{`Plataforma: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`}>
            {entry.dataKey}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// FUNÇÃO AUXILIAR: Retorna uma cor baseada no índice
function getColor(index: number): string {
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#FF8042",
    "#0088FE",
    "#FFBB28",
    "#FF8042",
  ];
  return colors[index % colors.length];
}

export function PlatformStackedBarChart({ earningsData }: { earningsData: any[] }) {
  const data = groupByPlatformAndRideType(earningsData);
  
  // Ordena os dados com base no total de corridas (soma dos ride types) de forma crescente
  data.sort((a, b) => {
    const totalA = Object.keys(a).reduce(
      (acc, key) => (key !== "platformName" ? acc + Number(a[key]) : acc),
      0
    );
    const totalB = Object.keys(b).reduce(
      (acc, key) => (key !== "platformName" ? acc + Number(b[key]) : acc),
      0
    );
    return totalA - totalB;
  });

  // Extrai todos os ride types dinamicamente (excluindo "platformName")
  const rideTypesSet = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== "platformName") {
        rideTypesSet.add(key);
      }
    });
  });
  const rideTypes = Array.from(rideTypesSet);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plataformas por Tipo de Corrida</CardTitle>
        <CardDescription>
          Distribuição dinâmica dos ride types por plataforma (ordenado do menor para o maior)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <XAxis type="number" />
            <YAxis type="category" dataKey="platformName" />
            <RechartsTooltip content={<CustomStackedTooltip />} />
            <Legend />
            {rideTypes.map((rideType, idx) => (
              <Bar key={rideType} dataKey={rideType} stackId="a" fill={getColor(idx)} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex items-center gap-2 text-sm">
        <TrendingUp className="h-4 w-4" />
        <span>Plataformas agrupadas por tipo de corrida</span>
      </CardFooter>
    </Card>
  );
}
