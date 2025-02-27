"use client";

import React, { useState } from "react";
import { auth } from "@/lib/db/firebaseServices";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "E-mail de recuperação enviado!" });
    } catch (error: any) {
      console.error("Erro na recuperação de senha:", error);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="m@exemplo.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit">Recuperar Senha</Button>
    </form>
  );
}
