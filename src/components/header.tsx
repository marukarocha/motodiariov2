'use client';

import { Bell, User, LogOut } from "lucide-react"; // Importe o ícone de logout
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/lib/db/firebaseServices"; // Importe a função de logout
import { useRouter } from 'next/navigation'; // Importe useRouter

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login'); // Redireciona para a página de login após o logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Trate o erro, por exemplo, exibindo uma mensagem para o usuário
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">Moto Diário</span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a className="transition-colors hover:text-foreground/80 text-foreground" href="/earnings">
              Ganhos
            </a>
            <a className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/dashboard/customers">
              Corridas
            </a>
            <a className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/fuelings">
              Abastecimentos
            </a>
            <a className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/bike">
              Moto
            </a>
            <a className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/maintenance">
              Manutenções
            </a>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="ghost" className="relative" size="icon">
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
            </Button>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}> {/* Botão de logout */}
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
