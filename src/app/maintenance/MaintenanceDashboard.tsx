'use client';

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
import { GiFlatTire, GiPokecog } from "react-icons/gi";
import { FaOilCan,  FaCogs, FaTools } from "react-icons/fa";
import RegisterManutencaoForm from "./RegisterManutencaoForm";

interface MaintenanceOption {
  label: string;
  icon: React.ReactNode;
  type: string;
}

const maintenanceOptions: MaintenanceOption[] = [
  { label: "Troca de Óleo", icon: <FaOilCan size={48} />, type: "troca de óleo" },
  { label: "Troca de Pneus", icon: <GiFlatTire size={48} />, type: "troca de pneus" },
  { label: "Troca de Relação", icon: <GiPokecog size={48} />, type: "troca de relação" },
  { label: "Manutenção do Motor", icon: <FaTools size={48} />, type: "manutenção do motor" },
];

export default function MaintenanceDashboard() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {maintenanceOptions.map((option) => (
        <Dialog
          key={option.type}
          open={openDialog === option.type}
          onOpenChange={(open) => setOpenDialog(open ? option.type : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="
                flex flex-col items-center justify-center 
                p-6 h-40 w-full
                hover:scale-105 transition-transform
              "
            >
              {option.icon}
              <span className="mt-2 text-center font-semibold">
                {option.label}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{option.label}</DialogTitle>
              <DialogDescription>
                Registre os dados para {option.label.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>
            <RegisterManutencaoForm
              maintenanceType={option.type}
              onClose={() => setOpenDialog(null)}
            />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
