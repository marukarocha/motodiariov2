"use client";

import { useState, useEffect } from "react";
import { getMaintenance, deleteMaintenance, getLastOdometerRecord, getBikeData } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import MaintenanceDashboard from "@/app/maintenance/MaintenanceDashboard";
import ListMaintenance from "@/app/maintenance/listMaintenance";

export default function ManutencoesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [manutencoes, setManutencoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastMileage, setLastMileage] = useState<number>(0);
  const [bikeConfig, setBikeConfig] = useState<any>(null);
  const [maintenanceTypes, setMaintenanceTypes] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchManutencoes();
      fetchBikeConfig();
      fetchLastOdometer();
      fetchMaintenanceTypes();
    }
  }, [currentUser]);

  const fetchManutencoes = async () => {
    setIsLoading(true);
    try {
      if (!currentUser) return;
      const data = await getMaintenance(currentUser.uid);
      setManutencoes(data || []);
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao carregar manutenções.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBikeConfig = async () => {
    if (!currentUser) return;
    try {
      const config = await getBikeData(currentUser.uid);
      if (config) {
        setBikeConfig({
          maintenanceIntervals: {
            "troca de óleo": config.oilChangeInterval,
            "troca de relação": config.relationChangeKm,
            "lubrificação": config.lubricationKm,
          },
          lastMaintenance: config.lastMaintenance,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configuração da bike:", error);
    }
  };

  const fetchLastOdometer = async () => {
    if (!currentUser) return;
    try {
      const lastRecord = await getLastOdometerRecord(currentUser.uid);
      if (lastRecord) {
        setLastMileage(lastRecord.currentMileage);
      }
    } catch (error) {
      console.error("Erro ao buscar odômetro:", error);
    }
  };

  const fetchMaintenanceTypes = async () => {
    try {
      const res = await fetch("/api/maintenance-types");
      const data = await res.json();
      setMaintenanceTypes(data);
    } catch (error) {
      console.error("Erro ao buscar tipos de manutenção:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Manutenções</h1>
      <MaintenanceDashboard />
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <ListMaintenance
          manutencoes={manutencoes}
          lastMileage={lastMileage}
          bikeConfig={bikeConfig}
          handleEdit={(id) => router.push(`/maintenance/edit/${id}`)}
          handleDelete={async (id) => {
            await deleteMaintenance(currentUser.uid, id);
            setManutencoes((prev) => prev.filter((m) => m.id !== id));
            toast({ title: "Manutenção deletada", description: "Registro removido com sucesso." });
          }}
          maintenanceTypes={maintenanceTypes}
        />
      )}
    </div>
  );
}
