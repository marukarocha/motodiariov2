"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

// Suas mensagens/dicas de cuidados, segurança, economia etc
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
  "Dica extra: mantenha sempre uma garrafa de água por perto para se hidratar."
];

export default function GlobalPreloader({ minTime = 2000 }) {
  const [show, setShow] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const pathname = usePathname();
  const tipsLength = MOTO_TIPS.length;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ao trocar de rota, mostra e sorteia nova mensagem inicial
  useEffect(() => {
    setShow(true);
    setTipIndex(Math.floor(Math.random() * tipsLength));

    const timeout = setTimeout(() => setShow(false), minTime);

    // Troca dica a cada 2 segundos enquanto está mostrando o loader
    if (intervalRef.current) clearInterval(intervalRef.current as any);
    intervalRef.current = setInterval(() => {
      setTipIndex((idx) => (idx + 1) % tipsLength);
    }, 2000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current as any);
    };
  }, [pathname, minTime, tipsLength]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, scale: 1, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1, y: 600 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center"
        >
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin mb-6"></div>
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
