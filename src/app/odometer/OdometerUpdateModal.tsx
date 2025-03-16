"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addOdometerRecord, getLastOdometerRecord,updateOdometerRecord  } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { FaCamera } from "react-icons/fa";

interface OdometerUpdateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OdometerUpdateModal({ open, onClose }: OdometerUpdateModalProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [odometer, setOdometer] = useState("");
  const [lastOdometer, setLastOdometer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Busca o último registro do odômetro ao abrir o modal
  useEffect(() => {
    async function fetchLastOdometer() {
      if (!currentUser) return;
      const lastRecord = await getLastOdometerRecord(currentUser.uid);
      if (lastRecord) {
        setLastOdometer(lastRecord.currentMileage);
      }
    }

    if (open) fetchLastOdometer();
  }, [open, currentUser]);

  // Processar imagem com OCR
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng", {
        logger: (m) => console.log(m),
      });

      const extractedOdometer = text.match(/\d{4,6}/); // Captura números entre 4 e 6 dígitos
      if (extractedOdometer) {
        setOdometer(extractedOdometer[0]); // Define o valor do odômetro
      } else {
        toast({ title: "Erro", description: "Não foi possível extrair o odômetro.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao processar a imagem.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Salvar no Firebase
  const handleSave = async () => {
    if (!currentUser) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
  
    const mileageValue = Number(odometer);
    if (!mileageValue || isNaN(mileageValue)) {
      toast({ title: "Erro", description: "Insira um valor válido.", variant: "destructive" });
      return;
    }
  
    setLoading(true);
    try {
      // ✅ 1. Criamos o registro inicial no Firebase
      const newRecordId = await addOdometerRecord(currentUser.uid, {
        currentMileage: mileageValue,
        source: "manual", // ✅ Definir como manual
        note: `Manual: Id`, // ✅ Inclui "Manual: Id" na nota
        recordedAt: new Date(),
      });
  
      await updateOdometerRecord(currentUser.uid, newRecordId, { sourceId: newRecordId });
  
      toast({ title: "Sucesso", description: `Odômetro atualizado com sucesso!`, variant: "success" });
      onClose();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao atualizar o odômetro.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Odômetro</DialogTitle>
          <DialogDescription>Insira manualmente ou tire uma foto do painel.</DialogDescription>
        </DialogHeader>

        {lastOdometer !== null && (
          <p className="text-gray-500">Último registro: <strong>{lastOdometer} km</strong></p>
        )}

        {/* Entrada manual */}
        <Input
          type="text"
          placeholder="Digite o odômetro"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value.replace(/\D/g, ""))}
        />

        {/* Capturar imagem para OCR */}
        <label htmlFor="odometer-image" className="flex items-center gap-2 cursor-pointer bg-gray-200 p-2 rounded">
          <FaCamera className="text-gray-700" />
          <span>Capturar Foto</span>
          <input type="file" id="odometer-image" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        {/* Botão de salvar */}
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
