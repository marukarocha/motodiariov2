"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import RegisterFuelings from "./RegisterFuelings";
import { BiGasPump } from "react-icons/bi";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

interface RegisterFuelingButtonProps {
  onFuelingAdded: () => void;
}

export function RegisterFuelingButton({ onFuelingAdded }: RegisterFuelingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="mr-3 bg-green-900 hover: text-white font-bold py-2 px-4 rounded">
          <BiGasPump className="h-4 w-4 mr-2" />
          Registrar Abastecimento
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-100 justify-center items-center bg-[#1C1B22]">
        <DrawerHeader>
          <DrawerTitle>Registrar Abastecimento</DrawerTitle>
          <p>Preencha os dados do abastecimento.</p>
        </DrawerHeader>
        {/* Utilizamos um div que ocupa o restante do espaço para o conteúdo */}
        <div className="p-4 flex-1 overflow-auto">
          <RegisterFuelings
            onClose={() => setOpen(false)}
            onFuelingAdded={() => {
              setOpen(false);
              onFuelingAdded();
            }}
          />
        </div>
        <DrawerFooter>
          {/* <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button> */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
