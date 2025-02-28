// components/WelcomeModal.tsx
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/db/firebaseServices';
import { useAuth } from '@/components/USER/Auth/AuthContext';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [bikeModel, setBikeModel] = useState('');

  const handleSave = async () => {
    if (currentUser) {
      await updateUserData(currentUser.uid, { name, bikeModel });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bem-vindo!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Digite seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Modelo da sua moto"
            value={bikeModel}
            onChange={(e) => setBikeModel(e.target.value)}
          />
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
