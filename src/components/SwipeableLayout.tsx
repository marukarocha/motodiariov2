"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

const swipeRoutes = [
  "/",       
  "/earnings",
  "/fuelings",
  "/bike",
  "/maintenance",
  "/profile"
];

export default function SwipeableLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = swipeRoutes.indexOf(pathname) !== -1 ? swipeRoutes.indexOf(pathname) : 0;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextIndex = (currentIndex + 1) % swipeRoutes.length;
      router.push(swipeRoutes[nextIndex]);
    },
    onSwipedRight: () => {
      const prevIndex = (currentIndex - 1 + swipeRoutes.length) % swipeRoutes.length;
      router.push(swipeRoutes[prevIndex]);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        style={{ position: "relative", minHeight: "100vh" }}
      >
        {children}

        {/* Área de Swipe somente no rodapé */}
        <div
          {...handlers}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "80px", // altura da área de swipe
            zIndex: 50, // garantir que fique acima de outros elementos se necessário
            background: "transparent", // pode deixar visível se quiser testar
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
