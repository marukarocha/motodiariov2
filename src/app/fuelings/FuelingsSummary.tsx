import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Calendar } from "lucide-react";

interface EarningsSummaryProps {
  totalEarnings: number | null;
  averageEarningsPerHour: number | null;
  averageEarningsPerDay: number | null;
}

export function EarningsSummary({ totalEarnings, averageEarningsPerHour, averageEarningsPerDay }: EarningsSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
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
          <CardTitle className="text-sm font-medium">Média de Ganho por Hora</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {averageEarningsPerHour?.toFixed(2) || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média de Ganho por Dia</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {averageEarningsPerDay?.toFixed(2) || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
