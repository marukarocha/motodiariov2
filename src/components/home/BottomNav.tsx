"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Fuel, Bike, Wrench, User, List } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/fuelings", label: "Abastecer", icon: Fuel },
  { href: "/bike", label: "Moto", icon: Bike },
  { href: "/earnings", label: "Corridas", icon: List },
  { href: "/", label: "Início", icon: Home }, // Home no centro
  { href: "/maintenance", label: "Revisão", icon: Wrench },
  { href: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg md:hidden bg-white dark:bg-zinc-900 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <ul className="grid grid-cols-6 justify-around items-center h-16 text-sm">
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
