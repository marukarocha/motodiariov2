'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import RegisterFuelings from './RegisterFuelings';
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
        <Button>Registrar Abastecimento</Button>
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
