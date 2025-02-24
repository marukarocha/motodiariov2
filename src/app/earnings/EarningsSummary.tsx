'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface EarningsSummaryProps {
  totalEarnings: number | null;
  averageEarningsPerHour: number | null;
  averageEarningsPerDay: number | null;
}

export function EarningsSummary({ totalEarnings, averageEarningsPerHour, averageEarningsPerDay }: EarningsSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {totalEarnings?.toFixed(2) || 0}</div>
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
          <div className="text-2xl font-bold">R$ {averageEarningsPerHour?.toFixed(2) || 0}</div>
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
          <div className="text-2xl font-bold">R$ {averageEarningsPerDay?.toFixed(2) || 0}</div>
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
