"use client";

import React, { useState } from "react";
import { Bell, User, LogOut, Menu, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/lib/db/firebaseServices";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Fecha o menu ao clicar em um item
  const handleNavItemClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between">
        {/* Logo e navegação */}
        <div className="flex items-center space-x-4">
          <a className="flex items-center space-x-2" href="/">
            <span className="font-bold sm:inline-block">Moto Diário</span>
          </a>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a onClick={handleNavItemClick} className="transition-colors hover:text-foreground/80 text-foreground" href="/earnings">
              Ganhos
            </a>
            <a onClick={handleNavItemClick} className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/dashboard/customers">
              Corridas
            </a>
            <a onClick={handleNavItemClick} className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/fuelings">
              Abastecimentos
            </a>
            <a onClick={handleNavItemClick} className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/bike">
              Moto
            </a>
            <a onClick={handleNavItemClick} className="transition-colors hover:text-foreground/80 text-muted-foreground" href="/maintenance">
              Manutenções
            </a>
          </nav>
        </div>

        {/* Ações e menu mobile */}
        <div className="flex items-center space-x-2">
          {/* Ícone do perfil */}
          <div className="hidden md:block">
            <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
              <User className="h-4 w-4" />
              <span className="sr-only">Perfil</span>
            </Button>
          </div>
          {/* Menu mobile */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
          <div className="hidden md:block">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
            </Button>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
      {/* Menu mobile responsivo */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-background border-t">
          <div className="container flex flex-col py-2 space-y-1">
            <a onClick={handleNavItemClick} className="px-4 py-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" href="/earnings">
              Ganhos
            </a>
            <a onClick={handleNavItemClick} className="px-4 py-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" href="/dashboard/customers">
              Corridas
            </a>
            <a onClick={handleNavItemClick} className="px-4 py-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" href="/fuelings">
              Abastecimentos
            </a>
            <a onClick={handleNavItemClick} className="px-4 py-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" href="/bike">
              Moto
            </a>
            <a onClick={handleNavItemClick} className="px-4 py-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" href="/maintenance">
              Manutenções
            </a>
            <a onClick={handleNavItemClick} className="px-4 py-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" href="/profile">
              Perfil
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
