"use client";

import React, { useState } from "react";
import { auth } from "@/lib/db/firebaseServices";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Senhas não coincidem", variant: "destructive" });
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: "Cadastro realizado com sucesso!" });
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="m@exemplo.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Label htmlFor="password">Senha</Label>
      <Input
        id="password"
        type="password"
        placeholder="Digite sua senha"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Label htmlFor="confirm">Confirme a Senha</Label>
      <Input
        id="confirm"
        type="password"
        placeholder="Confirme sua senha"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <Button type="submit">Cadastrar</Button>
    </form>
  );
}
