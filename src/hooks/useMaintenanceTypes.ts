import { useState, useEffect } from "react";

// Cores para cada categoria
const categoryColors: Record<string, string> = {
  "Sistema de Freios": "#e57373",
  "Motor": "#81c784",
  "Lubrificação e Filtros": "#64b5f6",
  "Suspensão e Direção": "#ffd54f",
  "Rodagem": "#a1887f",
  "Transmissão": "#4db6ac",
  "Sistema Elétrico": "#ba68c8",
  "Outros": "#90a4ae",
};

export interface MaintenanceOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  fields: Array<{ name: string; type: string; label: string }>;
  maintenanceInterval: number;
}

export interface MaintenanceCategory {
  category: string;
  items: MaintenanceOption[];
}

export interface MaintenanceTypeFlat {
  id: string;
  label: string;
  icon: string;
  color: string;
  number: number;
  category: string;
  description: string;
  maintenanceInterval: number;
  fields: Array<{ name: string; type: string; label: string }>;
}

export function useMaintenanceTypes() {
  const [maintenanceCategories, setMaintenanceCategories] = useState<MaintenanceCategory[]>([]);
  const [maintenanceTypesFlat, setMaintenanceTypesFlat] = useState<MaintenanceTypeFlat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaintenanceCategories() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/maintenance-types");
        if (!res.ok) throw new Error("Erro ao buscar categorias de manutenção");
        const data: MaintenanceCategory[] = await res.json();
        setMaintenanceCategories(data);

        // Flat list
        const flat: MaintenanceTypeFlat[] = [];
        data.forEach((cat) => {
          cat.items.forEach((item, idx) => {
            flat.push({
              ...item,
              color: categoryColors[cat.category] || "#888",
              number: idx + 1,
              category: cat.category,
            });
          });
        });
        setMaintenanceTypesFlat(flat);
      } catch (error) {
        setError("Falha ao carregar as categorias de manutenção.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMaintenanceCategories();
  }, []);

  return {
    maintenanceCategories,
    maintenanceTypesFlat,
    isLoading,
    error,
  };
}
