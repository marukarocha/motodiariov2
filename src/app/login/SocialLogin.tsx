"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/db/firebaseServices";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export function SocialLogin() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  // Para armazenar o confirmationResult e utilizá-lo para verificar o código.
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Login com Google efetuado com sucesso.
      toast({ title: "Login com Google realizado com sucesso!" });
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      toast({
        title: "Erro no login com Google",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePhoneLogin = async () => {
    try {
      // Inicializa o reCAPTCHA invisível
      const recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setIsCodeSent(true);
      toast({ title: "Código de verificação enviado!" });
    } catch (error: any) {
      console.error("Erro no login com telefone:", error);
      toast({
        title: "Erro no login com telefone",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult) return;
    try {
      await confirmationResult.confirm(verificationCode);
      toast({ title: "Login com telefone realizado com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao verificar código:", error);
      toast({
        title: "Erro na verificação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Login com Google */}
      <Button onClick={handleGoogleLogin} className="w-full">
        Entrar com Google
      </Button>

      {/* Login com Telefone */}
      <div className="border p-4 rounded-md">
        <Label className="block mb-2">Login com Telefone</Label>
        <Input
          type="tel"
          placeholder="+55 11 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button onClick={handlePhoneLogin} className="w-full mt-2">
          Enviar Código
        </Button>
        {isCodeSent && (
          <div className="mt-2 space-y-2">
            <Input
              type="text"
              placeholder="Digite o código de verificação"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <Button onClick={handleVerifyCode} className="w-full">
              Verificar Código
            </Button>
          </div>
        )}
        {/* Container para o reCAPTCHA */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
