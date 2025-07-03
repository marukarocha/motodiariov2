"use client";

import { useEffect, useState } from "react";
import { getLastOilChange, getCurrentOdometer } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useMaintenanceTypes } from "@/hooks/useMaintenanceTypes";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronDown,
  FaChevronUp,
  FaWrench,
  FaMapMarkerAlt,
  FaCalendarAlt
} from "react-icons/fa";

export default function OilChangeStatusBar() {
  const { currentUser } = useAuth();
  const { maintenanceTypesFlat } = useMaintenanceTypes();

  const [lastKm, setLastKm] = useState<number | null>(null);
  const [currentKm, setCurrentKm] = useState<number | null>(null);
  const [interval, setInterval] = useState<number>(3000); // fallback
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tipo = "Troca de Óleo";
    const tipoObj = maintenanceTypesFlat.find(
      (t) => t.label.toLowerCase() === tipo.toLowerCase()
    );
    if (tipoObj?.maintenanceInterval) {
      setInterval(tipoObj.maintenanceInterval);
    }
  }, [maintenanceTypesFlat]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      const last = await getLastOilChange(currentUser.uid);
      const odometer = await getCurrentOdometer(currentUser.uid);

      if (last?.km) setLastKm(last.km);
      if (odometer?.currentMileage) setCurrentKm(odometer.currentMileage);
      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  if (!currentUser || loading || lastKm === null || currentKm === null) return null;

  const diff = currentKm - lastKm;
  const progress = Math.min((diff / interval) * 100, 100);

  let barColor = "bg-green-500";
  if (progress >= 85) barColor = "bg-red-500";
  else if (progress >= 65) barColor = "bg-yellow-400";

  return (
    <div className="w-full mt-4  pt-4">
      <div
        className="cursor-pointer w-full"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="relative w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${progress}%` }}
          />
          <span className="absolute right-2 top-[-1.5rem] text-xs text-zinc-300">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="flex justify-between items-center mt-2 text-sm text-zinc-400">
          <span>Nível Oleo</span>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-2 text-sm text-white bg-zinc-900 border border-white/10 rounded-lg p-4"
          >
            <p>
              <FaWrench className="inline mr-1 text-zinc-400" />
              Última troca: <strong>{lastKm} km</strong>
            </p>
            <p>
              <FaMapMarkerAlt className="inline mr-1 text-zinc-400" />
              Atual: <strong>{currentKm} km</strong>
            </p>
            <p>
              🔁 Intervalo: <strong>{interval} km</strong>
            </p>
            <p>
              <FaCalendarAlt className="inline mr-1 text-zinc-400" />
              Próxima recomendada com: <strong>{lastKm + interval} km</strong>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
