"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMaintenanceTypes } from "@/hooks/useMaintenanceTypes";
import RegisterManutencaoForm from "./RegisterManutencaoForm";
import MotoMapaInterativo from "./MapaMoto";
import Tips from "@/components/Tips";

export default function MaintenanceDashboard() {
  const { maintenanceCategories, maintenanceTypesFlat, isLoading, error } = useMaintenanceTypes();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  if (isLoading) return <p>Carregando tipos de manutenção...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-10">
            <Tips /> {/* <- Aqui exibe a dica */}

      {/* Imagem interativa da moto */}
      <MotoMapaInterativo
        onSelectItem={(itemId) => setOpenDialog(itemId)}
        highlightedItemId={openDialog}
        maintenanceMap={maintenanceTypesFlat} // use o flat aqui se precisar passar o mapa para pins
      />

      {/* Dialog por Categoria */}
      {maintenanceCategories.map((category) => (
        <Dialog
          key={category.category}
          open={selectedCategory === category.category}
          onOpenChange={(open) => !open && setSelectedCategory(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{category.category}</DialogTitle>
              <DialogDescription>Selecione o tipo de manutenção</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {category.items.map((option) => (
                <button
                  key={option.id}
                  className="border p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  style={{ borderColor: "#eee", color: "#333" }}
                  onClick={() => setOpenDialog(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      ))}

      {/* Subdialog para formulário de manutenção */}
      {maintenanceCategories.flatMap((c) => c.items).map((option) => (
        <Dialog
          key={option.id}
          open={openDialog === option.id}
          onOpenChange={(open) => !open && setOpenDialog(null)}
        >
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
      ))}
    </div>
  );
}
