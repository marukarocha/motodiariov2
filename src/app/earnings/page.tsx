"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterEarningButton } from "@/app/earnings/RegisterEarningButton";
import { EarningsSummary } from "@/app/earnings/EarningsSummary";
import { DateFilter } from "@/components/DataFilter";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { DataTableEarnings, Earning } from "@/app/earnings/components/EarningsTable";
import { PlatformBarChart, DailyHoursLineChart } from "@/app/earnings/components/EarningsCharts";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { getEarnings } from "@/lib/db/firebaseServices";

export default function EarningsPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para o filtro de datas
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Estado para os ganhos
  const [earningsData, setEarningsData] = useState<Earning[]>([]);

  // Estado para controlar a exibição dos gráficos
  const [showCharts, setShowCharts] = useState(false);

  // Função para carregar os ganhos com filtro de datas
  const fetchData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await getEarnings(currentUser.uid, startDate, endDate);
      setEarningsData(data || []);
    } catch (err) {
      console.error("Erro ao buscar ganhos:", err);
      setError("Erro ao carregar ganhos.");
      toast({ title: "Erro!", description: "Erro ao carregar ganhos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza os dados sempre que o filtro ou o usuário mudar
  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser, startDate, endDate]);

  return (
    <div className="container mx-auto p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Seus Ganhos</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <RegisterEarningButton onEarningAdded={fetchData} />
        <Link href="/earnings/ocr">
          <Button variant="outline">Processar Prints</Button>
        </Link>
        <Button variant="outline" onClick={() => setShowCharts((prev) => !prev)}>
          {showCharts ? "Ocultar Gráficos" : "Exibir Gráficos"}
        </Button>
        <DateFilter onDateSelected={(from, to) => { setStartDate(from); setEndDate(to); }} />
      </div>

      {/* Atualiza o EarningsSummary com os dados filtrados */}
      <EarningsSummary earningsData={earningsData} />

      <Card className="mt-6">
        {showCharts && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <PlatformBarChart earningsData={earningsData} />
            <DailyHoursLineChart earningsData={earningsData} />
          </div>
        )}
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Ganhos</CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoading && earningsData ? (
            <DataTableEarnings data={earningsData} onRefresh={fetchData} />
          ) : (
            <p>Carregando...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
