"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/db/firebaseServices";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Um ícone simples para o Google (pode ser ajustado conforme necessário)
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="h-6 w-6 mr-2"
  >
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.24 3.22l6.87-6.87C36.31 4.12 30.5 2 24 2 14.64 2 6.55 7.53 2.77 15.03l7.62 5.92C12.56 14.05 17.69 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.5c0-1.65-.14-3.24-.4-4.75H24v9h12.8c-.55 2.94-2.23 5.43-4.75 7.1l7.26 5.64C44.62 38.45 46.98 32.91 46.98 24.5z" />
    <path fill="#FBBC05" d="M10.39 28.59a13.62 13.62 0 0 1 0-8.18l-7.62-5.92C.77 17.32 0 20.51 0 24s.77 6.68 2.77 9.31l7.62-5.92z" />
    <path fill="#34A853" d="M24 46c6.5 0 12.31-2.16 16.42-5.9l-7.26-5.64c-2.02 1.36-4.62 2.17-9.16 2.17-6.31 0-11.44-4.55-13.32-10.68l-7.62 5.92C6.55 40.47 14.64 46 24 46z" />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('uid', userCredential.user.uid);
      toast({ title: "Login realizado com sucesso!" });
      router.push('/');
    } catch (error: any) {
      console.error("Erro no login:", error);
      if (error.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Email ou senha incorretos.');
      } else {
        setError('Ocorreu um erro ao fazer login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem('uid', result.user.uid);
      toast({ title: "Login com Google realizado com sucesso!" });
      router.push('/');
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      toast({ title: "Erro no login com Google", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-6")}>
      <div className="flex items-center gap-4">
        <img src="/login/logo.png" alt="Logo" className="h-16 w-auto" />
        <span className="font-bold text-3xl">Moto Diário</span>
      </div>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Lado esquerdo: Formulário de login */}
          <div className="load-content">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                <p className="text-sm text-muted-foreground">Faça login na sua conta.</p>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a href="/login/forgot-password" className="ml-auto text-sm underline">
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Carregando..." : "Login"}
              </Button>
              <div className="mt-4 flex flex-col items-center gap-4">
                    <Button variant="outline" onClick={handleGoogleLogin} className="w-full flex items-center justify-center">
                    <GoogleIcon />
                    Entrar com Google
                    </Button>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                    Ao clicar em continuar, você concorda com nossos <a href="#">Termos de Serviço</a> e <a href="#">Política de Privacidade</a>.
                </div>
              <div className="text-center text-sm">
                Não tem uma conta? <a href="/login/register" className="underline">Cadastre-se</a>
              </div>
            </div>
          </form>
          </div>
          {/* Lado direito: Imagem de login */}
          <div className="relative hidden bg-muted md:block">
            {typeof window !== "undefined" && (
              <img
                src="/login/login.jpg"
                alt="Imagem de login"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
              />
            )}
          </div>
        </CardContent>
      </Card>
      {/* Área extra abaixo do formulário para login social */}
      
    </div>
  );
}
