'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import RegisterFuelings from './RegisterFuelings';
import { PlusCircleIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';

interface RegisterFuelingButtonProps {
  onFuelingAdded: () => void;
}

export function RegisterFuelingButton({ onFuelingAdded }: RegisterFuelingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='mr-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>
        <PlusCircleIcon className="h-4 w-4 mr-2" />
          Registrar Abastecimento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Abastecimento</DialogTitle>
          <DialogDescription>
            Preencha os dados do abastecimento.
          </DialogDescription>
        </DialogHeader>
        <RegisterFuelings
          onClose={() => setOpen(false)}
          onFuelingAdded={() => {
            setOpen(false);
            onFuelingAdded();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
