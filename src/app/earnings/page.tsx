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
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { getEarnings } from "@/lib/db/firebaseServices";
import { Button } from "@/components/ui/button";

export default function EarningsPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Estado para armazenar os ganhos
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [earningsData, setEarningsData] = useState<Earning[]>([]);
  // Estado para exibir ou ocultar os gráficos
  const [showCharts, setShowCharts] = useState(false);

  // Função para carregar os ganhos
  const fetchData = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const data = await getEarnings(currentUser.uid);
      setEarningsData(data || []);
    } catch (err) {
      console.error("Erro ao buscar ganhos:", err);
      setError("Erro ao carregar ganhos.");
      toast({ title: "Erro!", description: "Erro ao carregar ganhos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser, selectedStartDate, selectedEndDate]);

  return (
    <div className="container mx-auto p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Seus Ganhos</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <RegisterEarningButton onEarningAdded={fetchData} />
        <Link href="/earnings/ocr">
          <Button variant="outline">Processar Prints</Button>
        </Link>
      </div>
      <DateFilter onDateSelected={setSelectedStartDate} />
      <EarningsSummary earningsData={earningsData} />
      
      <div className="flex justify-end mb-4">
        <Button variant="outline" className="mt-5" onClick={() => setShowCharts((prev) => !prev)}>
          {showCharts ? "Ocultar Gráficos" : "Exibir Gráficos"}
        </Button>
      </div>
      
      {showCharts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <PlatformBarChart earningsData={earningsData} />
          <DailyHoursLineChart earningsData={earningsData} />
        </div>
      )}

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
