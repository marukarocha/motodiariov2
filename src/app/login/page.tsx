'use client'; 
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const { auth } = useAuth(); // auth deve estar disponível aqui
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
      
    </div>
  )
}
