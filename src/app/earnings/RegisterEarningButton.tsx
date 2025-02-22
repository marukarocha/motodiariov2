'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from 'lucide-react';
import RegisterEarnings from '@/app/earnings/RegisterEarnings'; // Ajuste o caminho se necessário
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface RegisterEarningButtonProps {
  onEarningAdded: () => void;
}

export function RegisterEarningButton({ onEarningAdded }: RegisterEarningButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Registrar Ganho
        </Button>
      </DialogTrigger>
      <RegisterEarnings
        onClose={() => setIsOpen(false)}
        onEarningAdded={() => {
          setIsOpen(false); // Fecha o modal após adicionar
          onEarningAdded(); // Chama a função para atualizar a lista
        }}
      />
    </Dialog>
  );
}
