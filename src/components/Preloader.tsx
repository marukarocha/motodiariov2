"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const MOTO_TIPS = [
  "Dica: Confira a calibragem dos pneus antes de sair para rodar.",
  "Você sabia? A troca regular de óleo garante mais vida útil para o motor.",
  "Use sempre o capacete bem afivelado, mesmo para trajetos curtos.",
  "Dica de economia: acelere suavemente para reduzir o consumo de combustível.",
  "Não esqueça de checar os freios antes de iniciar o dia.",
  "Atenção: moto limpa é sinal de cuidado e previne corrosão.",
  "Evite rodar com o tanque na reserva para não danificar a bomba de combustível.",
  "Faça revisões periódicas e mantenha sua moto sempre em dia.",
  "Planeje paradas estratégicas para descanso em corridas longas.",
  "Use apps de mapas para evitar áreas perigosas ou com trânsito pesado.",
  "Ganhe mais: aceite corridas próximas ao seu trajeto para economizar tempo.",
  "Dica extra: mantenha sempre uma garrafa de água por perto para se hidratar.",
];

export default function GlobalPreloader({ minTime = 2000 }) {
  const [show, setShow] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const pathname = usePathname();
  const tipsLength = MOTO_TIPS.length;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setShow(true);
    setTipIndex(Math.floor(Math.random() * tipsLength));

    const timeout = setTimeout(() => setShow(false), minTime);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTipIndex((idx) => (idx + 1) % tipsLength);
    }, 2000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname, minTime, tipsLength]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: 600 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center"
        >
          {/* Logo com animação de bounce */}
         <motion.img
            src="/logo/logo.webp"
            alt="Logo"
            className="w-32 h-32 object-contain mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              bounce: 0.5,
              duration: 0.8,
            }}
          />

          {/* Texto animado com dica */}
          <AnimatePresence mode="wait">
            <motion.h3
              key={tipIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="text-white text-lg text-center max-w-xs px-4"
            >
              {MOTO_TIPS[tipIndex]}
            </motion.h3>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
