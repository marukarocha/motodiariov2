// src/components/ui/confirm-delete-alert.tsx
"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Ajuste o caminho conforme sua estrutura
import { Button } from "@/components/ui/button";

interface ConfirmDeleteAlertProps {
  onConfirm: () => void;
  children: React.ReactNode;
}

const ConfirmDeleteAlert: React.FC<ConfirmDeleteAlertProps> = ({ onConfirm, children }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirma a exclusão?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não tem volta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Excluir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteAlert;
