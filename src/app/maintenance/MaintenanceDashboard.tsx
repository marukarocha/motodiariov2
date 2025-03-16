"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import RegisterManutencaoForm from "./RegisterManutencaoForm";
import { iconsMap } from "@/app/maintenance/iconsMap"; // Importação correta
import { useMaintenanceTypes } from "@/hooks/useMaintenanceTypes";

export default function MaintenanceDashboard() {
  const { maintenanceOptions, isLoading, error } = useMaintenanceTypes();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  if (isLoading) return <p>Carregando tipos de manutenção...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      {maintenanceOptions.map((option) => {
        // ✅ Obtendo o ícone corretamente do `iconsMap`
        const IconComponent = iconsMap[option.icon];

        return (
          <Dialog
            key={option.id}
            open={openDialog === option.id}
            onOpenChange={(open) => setOpenDialog(open ? option.id : null)}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="
                  flex flex-row md:flex-col items-center justify-center 
                  p-4 h-16 md:h-40 w-full
                  hover:scale-105 transition-transform
                "
              >
                {/* ✅ Agora renderiza o ícone corretamente */}
                {IconComponent ? <IconComponent className="text-4xl text-gray-700" /> : null}

                <span className="ml-2 md:mt-2 text-center font-semibold">
                  {option.label}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{option.label}</DialogTitle>
                <DialogDescription>{option.description}</DialogDescription>
              </DialogHeader>
              <RegisterManutencaoForm
                maintenanceType={option.id}
                maintenanceOption={option}
                onClose={() => setOpenDialog(null)}
              />
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
