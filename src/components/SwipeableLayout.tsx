// components/SwipeableLayout.tsx
"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

// Defina as rotas na ordem desejada
const swipeRoutes = [
  "/",       // rota inicial (home)
  "/earnings",
  "/fuelings",
  "/bike",
  "/maintenance",
  "/profile"
];

export default function SwipeableLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Encontra o índice da rota atual, padrão para 0 se não encontrado
  const currentIndex = swipeRoutes.indexOf(pathname) !== -1 ? swipeRoutes.indexOf(pathname) : 0;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Ao deslizar para a esquerda, calcula o próximo índice com wrap-around
      const nextIndex = (currentIndex + 1) % swipeRoutes.length;
      router.push(swipeRoutes[nextIndex]);
    },
    onSwipedRight: () => {
      // Ao deslizar para a direita, calcula o índice anterior com wrap-around
      const prevIndex = (currentIndex - 1 + swipeRoutes.length) % swipeRoutes.length;
      router.push(swipeRoutes[prevIndex]);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false // ajuste para true se desejar testar também no desktop
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        {...handlers}
        key={pathname}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
