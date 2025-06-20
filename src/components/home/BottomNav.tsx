"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Home,
  Fuel,
  Bike,
  Wrench,
  User,
  List,
  PlusCircle,
  Gauge,
} from "lucide-react";

import  RegisterFuelings  from "@/app/fuelings/components/RegisterFuelings";
import OdometerUpdateModal from "@/app/odometer/OdometerUpdateModal";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Dialog } from "@/components/ui/dialog";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Controle dos modais customizados
  const [showFuelingDrawer, setShowFuelingDrawer] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isFuelingPage = pathname === "/fuelings";

  if (isFuelingPage) {
    return (
      <>
        <nav
          className={`fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg bg-white dark:bg-zinc-900 transition-transform duration-300 ${
            isVisible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <ul className="grid grid-cols-4 items-center h-16 text-sm px-2">
            <li className="text-center">
              <Link
                href="/fuelings"
                className="flex flex-col items-center justify-center py-2 hover:text-primary transition"
              >
                <List className="h-5 w-5 mb-0.5" />
                <span className="text-[11px]">Lista</span>
              </Link>
            </li>
            <li className="text-center">
              <button
                onClick={() => setShowFuelingDrawer(true)}
                className="flex flex-col items-center justify-center w-full h-full hover:text-primary transition"
              >
                <PlusCircle className="h-5 w-5 mb-0.5" />
                <span className="text-[11px]">Registrar</span>
              </button>
            </li>
            <li className="text-center">
              <button
                onClick={() => setShowOdometerModal(true)}
                className="flex flex-col items-center justify-center w-full h-full hover:text-primary transition"
              >
                <Gauge className="h-5 w-5 mb-0.5" />
                <span className="text-[11px]">Odômetro</span>
              </button>
            </li>
            <li className="text-center">
              <button
                onClick={() => router.push("/")}
                className="flex flex-col items-center justify-center py-2 hover:text-primary transition"
              >
                <Home className="h-5 w-5 mb-0.5" />
                <span className="text-[11px]">Voltar</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Drawer personalizado para abastecimento */}
        <Drawer open={showFuelingDrawer} onOpenChange={setShowFuelingDrawer}>
          <DrawerContent className="bg-[#1C1B22]">
            <DrawerHeader>
              <DrawerTitle>Registrar Abastecimento</DrawerTitle>
              <p>Preencha os dados do abastecimento.</p>
            </DrawerHeader>
            <div className="p-4">
              <RegisterFuelings
                onClose={() => setShowFuelingDrawer(false)}
                onFuelingAdded={() => setShowFuelingDrawer(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>

        {/* Modal para odômetro */}
        <Dialog open={showOdometerModal} onOpenChange={setShowOdometerModal}>
          <OdometerUpdateModal
            open={showOdometerModal}
            onClose={() => setShowOdometerModal(false)}
            onUpdated={() => setShowOdometerModal(false)}
          />
        </Dialog>
      </>
    );
  }

  // Menu padrão com 6 itens
  const navItems = [
    { href: "/", label: "Início", icon: Home },
    { href: "/earnings", label: "Corridas", icon: List },
    { href: "/fuelings", label: "Abastecer", icon: Fuel },
    { href: "/maintenance", label: "Revisão", icon: Wrench },
    { href: "/bike", label: "Moto", icon: Bike },
    { href: "/profile", label: "Perfil", icon: User },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg md:hidden bg-white dark:bg-zinc-900 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <ul className="grid grid-cols-6 items-center h-16 text-sm">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="text-center">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center py-2 rounded-md transition-all duration-200 ease-in-out ${
                  isActive
                    ? "text-primary font-semibold bg-muted dark:bg-zinc-800"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span className="text-[11px]">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
