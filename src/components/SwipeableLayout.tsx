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

  const currentIndex = swipeRoutes.indexOf(pathname);
  // Swipe só em rotas elegíveis
  const isSwipeable = currentIndex !== -1;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isSwipeable) return;
      const nextIndex = (currentIndex + 1) % swipeRoutes.length;
      router.push(swipeRoutes[nextIndex]);
    },
    onSwipedRight: () => {
      if (!isSwipeable) return;
      const prevIndex = (currentIndex - 1 + swipeRoutes.length) % swipeRoutes.length;
      router.push(swipeRoutes[prevIndex]);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  // Só animar quando está em página swipeable
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 64 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -64 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        style={{ minHeight: "100vh" }}
      >
        {children}

        {/* Área de Swipe só nas rotas swipeable */}
        {isSwipeable && (
          <div
            {...handlers}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "80px",
              zIndex: 50,
              background: "transparent",
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
