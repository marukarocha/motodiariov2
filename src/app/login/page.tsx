// Arquivo: app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/lib/db/firebaseServices";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import RegisterForm from "./RegisterForm";

type AuthView = "login" | "register" | "forgot";

export default function AuthPage() {
  const [view, setView] = useState<AuthView>("login");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="overflow-hidden relative">
          <div className="md:hidden absolute inset-0">
            <img
              src="/login/login.jpg"
              alt="Imagem de login"
              className="h-full w-full object-cover opacity-50 blur-sm"
            />
          </div>
          <CardContent className="grid p-0 md:grid-cols-2 relative">
            <div className="load-content min-h-[350px] flex items-center">
              <AnimatePresence mode="wait">
                {view === "login" && (
                  <motion.div key="login" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }} className="w-full">
                    <LoginForm onSwitch={setView} />
                  </motion.div>
                )}
                {view === "register" && (
                  <motion.div key="register" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }} className="w-full">
                    <RegisterForm onSwitch={setView} />
                  </motion.div>
                )}
                {view === "forgot" && (
                  <motion.div key="forgot" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }} className="w-full">
                    <ForgotPasswordForm onSwitch={setView} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative hidden md:block">
              <img
                src="/login/login.jpg"
                alt="Imagem de login"
                className="h-[500px] h-full w-full object-cover dark:brightness-[0.8]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SwitchProps {
  onSwitch: (view: AuthView) => void;
}

interface LoginFormInputs {
  email: string;
  password: string;
}

function LoginForm({ onSwitch }: SwitchProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      localStorage.setItem("uid", userCredential.user.uid);
      toast({ title: "Login realizado com sucesso!" });
      router.push("/");
    } catch (error: any) {
      console.error("Erro no login:", error);
      let message = "Ocorreu um erro ao fazer login.";
      if (error.code === "auth/invalid-email") message = "Email inválido.";
      else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password")
        message = "Email ou senha incorretos.";
      toast({ title: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem("uid", result.user.uid);
      toast({ title: "Login com Google realizado com sucesso!" });
      router.push("/");
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      toast({ title: "Erro no login com Google", description: error.message, variant: "destructive" });
    }
  };

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Moto Diário</h1>
          <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground">Faça login na sua conta.</p>
        </div>
        <div className="flex flex-col">
          <Input type="text" placeholder="E-mail ou telefone" className={cn(errors.email ? "border-red-500 focus-visible:ring-red-500" : "", "w-full")} {...register("email", { required: "Informe seu e-mail ou telefone." })} />
          {errors.email && <span className="mt-1 text-xs text-red-500">{errors.email.message}</span>}
        </div>
        <div className="flex flex-col">
          <Input type="password" placeholder="Digite aqui sua senha" className={cn(errors.password ? "border-red-500 focus-visible:ring-red-500" : "", "w-full")} {...register("password", { required: "Informe sua senha." })} />
          {errors.password && <span className="mt-1 text-xs text-red-500">{errors.password.message}</span>}
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <button type="button" onClick={() => onSwitch("forgot")} className="text-white-600 underline hover:underline">Esqueceu a senha?</button>
          <button type="button" onClick={() => onSwitch("register")} className="text-white-600 underline hover:underline">Registrar</button>
        </div>
        <div className="mt-4 flex flex-col items-center gap-4">
          <Button type="submit" variant="outline" className="w-full hover:bg-primary hover:text-white transition-colors" disabled={isSubmitting}>{isSubmitting ? "Carregando..." : "Entrar"}</Button>
          <Button variant="outline" onClick={handleGoogleLogin} className="w-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
            <GoogleIcon />
            Entrar com Google
          </Button>
        </div>
      </div>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-6 w-6 mr-2">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.24 3.22l6.87-6.87C36.31 4.12 30.5 2 24 2 14.64 2 6.55 7.53 2.77 15.03l7.62 5.92C12.56 14.05 17.69 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.5c0-1.65-.14-3.24-.4-4.75H24v9h12.8c-.55 2.94-2.23 5.43-4.75 7.1l7.26 5.64C44.62 38.45 46.98 32.91 46.98 24.5z" />
      <path fill="#FBBC05" d="M10.39 28.59a13.62 13.62 0 0 1 0-8.18l-7.62-5.92C.77 17.32 0 20.51 0 24s.77 6.68 2.77 9.31l7.62-5.92z" />
      <path fill="#34A853" d="M24 46c6.5 0 12.31-2.16 16.42-5.9l-7.26-5.64c-2.02 1.36-4.62 2.17-9.16 2.17-6.31 0-11.44-4.55-13.32-10.68l-7.62 5.92C6.55 40.47 14.64 46 24 46z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

interface ForgotPasswordFormInputs {
  email: string;
}

function ForgotPasswordForm({ onSwitch }: SwitchProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>();
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({ title: "E-mail de recuperação enviado!" });
      onSwitch("login");
    } catch (error: any) {
      console.error("Erro na recuperação de senha:", error);
      toast({ title: "Erro na recuperação", description: error.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-6 md:p-8">
      <h1 className="text-2xl font-bold">Recuperar Senha</h1>
      <div className="flex flex-col">
        <Input type="email" placeholder="Seu e-mail" className={cn(errors.email ? "border-red-500 focus-visible:ring-red-500" : "", "w-full")} {...register("email", { required: "Informe seu e-mail.", pattern: { value: /\S+@\S+\.\S+/, message: "Formato de e-mail inválido." } })} />
        {errors.email && <span className="mt-1 text-xs text-red-500">{errors.email.message}</span>}
      </div>
      <Button type="submit" className="w-full bg-green-900 hover:bg-primary hover:text-white transition-colors">Enviar E-mail de Recuperação</Button>
      <div className="text-center text-sm">
        Voltar para <button type="button" onClick={() => onSwitch("login")} className="underline hover:text-primary">Login</button>
      </div>
    </form>
  );
}
