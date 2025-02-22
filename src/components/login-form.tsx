'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from '@/lib/db/firebaseServices';
import { signInWithEmailAndPassword } from "firebase/auth";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        console.log("handleSubmit called, auth:", auth);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Login bem-sucedido! User:", user);

            // Store the UID in localStorage
            localStorage.setItem('uid', user.uid);

            router.push('/'); // Redireciona para a página principal


        } catch (error: any) {
            console.error("Erro ao fazer login:", error);
            switch (error.code) {
                case 'auth/invalid-email':
                    setError('Email inválido.');
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setError('Email ou senha incorretos.');
                    break;
                default:
                    setError('Ocorreu um erro ao fazer login.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-6", className)} {...props}>
  <div className="flex items-center gap-4">
    <img
      src="/login/logo.png"
      alt="Imagem de login"
      className="h-16 w-auto"
    />
    <span className="font-bold text-3xl">Moto Diário</span>
  </div>
  <Card className="overflow-hidden">
    <CardContent className="grid p-0 md:grid-cols-2">
      <form className="p-6 md:p-8" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
            <p className="text-balance text-muted-foreground">
              Faça login na sua conta.
            </p>
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
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
              <a
                href="#"
                className="ml-auto text-sm underline-offset-2 hover:underline"
              >
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
          <div className="text-center text-sm">
            Não tem uma conta?{" "}
            <a href="#" className="underline underline-offset-4">
              Cadastre-se
            </a>
          </div>
        </div>
      </form>
      <div className="relative hidden bg-muted md:block">
        {typeof window !== 'undefined' && (
          <img
            src="/login/login.jpg"
            alt="Imagem de login"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
          />
        )}
      </div>
    </CardContent>
  </Card>
  <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
    Ao clicar em continuar, você concorda com nossos{" "}
    <a href="#">Termos de Serviço</a> e <a href="#">Política de Privacidade</a>.
  </div>
</div>
    );
}
