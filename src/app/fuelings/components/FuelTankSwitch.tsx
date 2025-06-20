"use client";

import { motion } from "framer-motion";
import { FaGasPump } from "react-icons/fa";
import { BsFuelPumpDiesel } from "react-icons/bs";

interface FuelTankSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function FuelTankSwitch({ checked, onChange }: FuelTankSwitchProps) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-16 h-8 flex items-center px-1 rounded-full cursor-pointer transition-colors duration-300 ${
        checked ? "bg-green-600" : "bg-gray-400 dark:bg-gray-600"
      }`}
    >
      <motion.div
        className="absolute left-1 top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow"
        animate={{ x: checked ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {checked ? (
          <FaGasPump className="text-green-700 text-xs" />
        ) : (
          <BsFuelPumpDiesel className="text-gray-600 text-xs" />
        )}
      </motion.div>
    </div>
  );
}
