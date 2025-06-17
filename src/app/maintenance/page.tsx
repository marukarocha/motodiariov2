"use client";

import { useState, useEffect } from "react";
import { getMaintenance, deleteMaintenance, getLastOdometerRecord, getBikeData, updateMaintenance } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MaintenanceDashboard from "@/app/maintenance/MaintenanceDashboard";
import ListMaintenance from "@/app/maintenance/listMaintenance";
import { useMaintenanceTypes } from "@/hooks/useMaintenanceTypes";

export default function ManutencoesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [manutencoes, setManutencoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastMileage, setLastMileage] = useState<number>(0);
  const [bikeConfig, setBikeConfig] = useState<any>(null);

  // Use só o hook (flat é o array para a tabela)
  const { maintenanceTypesFlat, isLoading: typesLoading, error: typesError } = useMaintenanceTypes();

  useEffect(() => {
    if (currentUser) {
      fetchManutencoes();
      fetchBikeConfig();
      fetchLastOdometer();
    }
    // eslint-disable-next-line
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

  const handleEdit = async (id: string, updatedData: any) => {
    if (!currentUser) return;
    try {
      await updateMaintenance(currentUser.uid, id, updatedData);
      fetchManutencoes();
      toast({ title: "Alterado com sucesso", description: "Os dados foram atualizados.", variant: "default" });
    } catch (error) {
      console.error("Erro ao editar manutenção:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar os dados.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteMaintenance(currentUser.uid, id);
      fetchManutencoes();
      toast({ title: "Removido com sucesso", description: "Registro removido.", variant: "default" });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível remover o registro.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Manutenções</h1>
      {/* Dashboard não precisa dos tipos como prop, pois já usa o hook internamente */}
      <MaintenanceDashboard />

      {isLoading || typesLoading ? (
        <p>Carregando...</p>
      ) : typesError ? (
        <p className="text-red-500">{typesError}</p>
      ) : (
        <ListMaintenance
          manutencoes={manutencoes}
          lastMileage={lastMileage}
          bikeConfig={bikeConfig}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          maintenanceTypes={maintenanceTypesFlat}
        />
      )}
    </div>
  );
}
