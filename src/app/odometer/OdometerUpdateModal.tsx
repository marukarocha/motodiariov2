"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addOdometerRecord, getLastOdometerRecord, updateOdometerRecord } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { FaCamera } from "react-icons/fa";
import Link from "next/link";

interface OdometerUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function OdometerUpdateModal({ open, onClose, onUpdated }: OdometerUpdateModalProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [odometer, setOdometer] = useState("");
  const [lastOdometer, setLastOdometer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLast() {
      if (!currentUser) return;
      const lastRecord = await getLastOdometerRecord(currentUser.uid);
      if (lastRecord) setLastOdometer(lastRecord.currentMileage);
    }
    if (open) fetchLast();
  }, [open, currentUser]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng");
      const match = text.match(/\d{4,6}/);
      if (match) {
        setOdometer(match[0]);
      } else {
        toast({ title: "Erro", description: "Não foi possível extrair o odômetro.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao processar a imagem.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
    const mileageValue = Number(odometer);
    if (!mileageValue || isNaN(mileageValue)) return toast({ title: "Erro", description: "Insira um valor válido.", variant: "destructive" });

    setLoading(true);
    try {
      const newRecordId = await addOdometerRecord(currentUser.uid, {
        currentMileage: mileageValue,
        source: "manual",
        note: `Manual: Id`,
        recordedAt: new Date(),
      });
      await updateOdometerRecord(currentUser.uid, newRecordId, { sourceId: newRecordId });
      toast({ title: "Sucesso", description: `Odômetro atualizado com sucesso!`, variant: "success" });
      onUpdated();  // ⚡ dispara atualização externa
      onClose();
    } catch {
      toast({ title: "Erro", description: "Falha ao atualizar o odômetro.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1C1B22]">
        <DialogHeader>
          <DialogTitle>Atualizar Odômetro</DialogTitle>
          <DialogDescription>Insira manualmente ou tire uma foto do painel.</DialogDescription>
        </DialogHeader>

        <Link href="/odometer" className="inline-block text-white px-4 py-2 rounded hover:bg-blue-700">Acessar Odometer</Link>

        {lastOdometer !== null && (
          <p className="text-gray-500">Último registro: <strong>{lastOdometer} km</strong></p>
        )}

        <Input
          type="text"
          placeholder="Digite o odômetro"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value.replace(/\D/g, ""))}
        />

        <label htmlFor="odometer-image" className="flex items-center gap-2 cursor-pointer p-2 rounded">
          <FaCamera className="text-gray-700" />
          <span>Capturar Foto</span>
          <input type="file" id="odometer-image" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        <Button className="bg-green-900" onClick={handleSave} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
