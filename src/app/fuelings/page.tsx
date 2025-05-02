'use client';

import React, { useEffect, useState } from "react";
import { Fueling } from "@/types/types";
import { getFuelings, getLastOdometerRecord, getBikeData } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { RegisterFuelingButton } from "@/app/fuelings/components/RegisterFuelingsButton";
import { DateFilter } from "@/components/DataFilter";
import { FuelingsSummary } from "@/app/fuelings/components/FuelingsSummary";
import ConsumptionCalculator from "@/app/fuelings/components/ConsumptionCalculator";
import FuelingList from "@/app/fuelings/components/FuelingsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FuelSummaryCard from "@/app/fuelings/components/FuelSummaryCard";
import { useFuelingsSummary } from "@/hooks/useFuelingsSummary";

export default function FuelingsPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [fuelingsData, setFuelingsData] = useState<Fueling[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [lastOdometer, setLastOdometer] = useState<number>(0);
  const [bikeConfig, setBikeConfig] = useState<any>(null);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFuelings(currentUser.uid, selectedDate);
      const lastRecord = await getLastOdometerRecord(currentUser.uid);
      const bikeData = await getBikeData(currentUser.uid);
      setFuelingsData(data || []);
      if (lastRecord) setLastOdometer(lastRecord.currentMileage);
      if (bikeData) setBikeConfig(bikeData);
    } catch (err) {
      console.error("Erro ao carregar abastecimentos:", err);
      setError("Erro ao carregar abastecimentos");
      toast({
        title: "Erro!",
        description: "Erro ao carregar abastecimentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser, selectedDate]);

  const { totalFuelings, fuelAvailable, kilometersRemaining } = useFuelingsSummary(
    fuelingsData,
    bikeConfig || undefined,
    lastOdometer
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Seus Abastecimentos</h1>

      <div className="flex gap-4 mb-4">
        <RegisterFuelingButton onFuelingAdded={fetchData} />
        <DateFilter onDateSelected={(from) => setSelectedDate(from)} />
      </div>
    

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
  <Card className="md:col-span-3">
    <CardHeader>
      <CardTitle>Consumo</CardTitle>
    </CardHeader>
    <CardContent>
      {bikeConfig && (
        <FuelSummaryCard
          fuelings={fuelingsData}
          fuelAvailable={fuelAvailable}
          tankVolume={bikeConfig.tankVolume}
          kilometersRemaining={kilometersRemaining}
          onUpdated={fetchData}
        />
      )}
    </CardContent>
  </Card>

  <Card className="md:col-span-2">
    <CardHeader>
      <CardTitle>Custos por km</CardTitle>
    </CardHeader>
    <CardContent>
      <ConsumptionCalculator
        valorLitro={6.52}
        consumoMedio={38}
        tanqueCapacity={12}
        tripDistance={20}
        oilChangeCostPerInterval={40}
        oilChangeInterval={1500}
        maintenanceCostPerMonth={300}
        estimatedMonthlyKm={1500}
      />
    </CardContent>
  </Card>
</div>



      

      <div className="mt-6">
        <FuelingsSummary fuelings={fuelingsData} />
      </div>
       
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Abastecimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <FuelingList
            fuelingsData={fuelingsData}
            isLoading={isLoading}
            error={error}
            fetchData={fetchData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
