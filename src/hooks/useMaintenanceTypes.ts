import { useState, useEffect } from "react";

interface MaintenanceOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  fields: Array<{ name: string; type: string; label: string }>;
  maintenanceInterval: number;
}

export function useMaintenanceTypes() {
  const [maintenanceOptions, setMaintenanceOptions] = useState<MaintenanceOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaintenanceOptions() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/maintenance-types");
        if (!res.ok) throw new Error("Erro ao buscar tipos de manutenção");
        const data = await res.json();
        setMaintenanceOptions(data);
      } catch (error) {
        console.error(error);
        setError("Falha ao carregar os tipos de manutenção.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMaintenanceOptions();
  }, []);

  return { maintenanceOptions, isLoading, error };
}
