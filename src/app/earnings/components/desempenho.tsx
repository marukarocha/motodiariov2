"use client";

import React from "react";
import { Clock } from "lucide-react";

interface DesempenhoProps {
  amount: number;
  mileage: number;
  duration?: string | number; // Pode ser string (ex.: "15 min") ou número (minutos)
}

const durationMapping: Record<string, number> = {
  "15 min": 0.25,
  "30 min": 0.5,
  "45 min": 0.75,
  "1 hora": 1,
  "1h 30min": 1.5,
  "2 horas": 2,
  "3 horas ou mais": 3,
};

export default function Desempenho({ amount, mileage, duration }: DesempenhoProps) {
  if (mileage === 0) return <p className="text-sm text-gray-500">Sem dados</p>;

  // Calcula a taxa de ganho por KM
  const earningsPerKm = amount / mileage;

  let durationHours: number | undefined;
  let displayDuration = "";

  if (typeof duration === "string") {
    durationHours = durationMapping[duration] || 0;
    displayDuration = duration;
  } else if (typeof duration === "number") {
    // Assume que o valor está em minutos, converte para horas
    durationHours = duration / 60;
    displayDuration = `${duration} min`;
  }

  const earningsPerHourStr = durationHours ? (amount / durationHours).toFixed(2) : "N/A";
  const earningsPerHour = durationHours ? parseFloat(earningsPerHourStr) : 0;

  // Define a cor do ícone do relógio conforme a classificação
  let clockColor = "text-white"; // cor padrão
  if (earningsPerHour < 15) {
    clockColor = "text-red-500";
  } else if (earningsPerHour < 25) {
    clockColor = "text-orange-500";
  } else if (earningsPerHour < 35) {
    clockColor = "text-green-400";
  } else if (earningsPerHour >= 40) {
    clockColor = "text-lime-500";
  }

  // Normaliza a porcentagem para escala de 0 a 100%
  const percentage = Math.min(Math.max((earningsPerKm / 2) * 100, 0), 100);

  const getColorFromPercentage = (percentage: number) => {
    if (percentage <= 33) {
      const red = 255;
      const green = Math.round((percentage / 33) * 255);
      return `rgb(${red}, ${green}, 0)`;
    } else if (percentage <= 66) {
      const red = Math.round(255 - ((percentage - 33) / 33) * 255);
      const green = 255;
      return `rgb(${red}, ${green}, 0)`;
    } else {
      const green = 255;
      const blue = Math.round(((percentage - 66) / 34) * 159);
      return `rgb(0, ${green}, ${blue})`;
    }
  };

  const solidColor = getColorFromPercentage(percentage);

  return (
    <div className="flex items-center gap-2">
      {/* Barra de desempenho */}
      <div className="relative w-40 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "#10101B" }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: solidColor,
          }}
        />
      </div>

      {/* Badge de ganho por KM */}
      <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-md">
        {earningsPerKm.toFixed(2)} R$/KM
      </span>

      {/* Badge que exibe duração e valor por hora, com ícone dinâmico */}
      {durationHours && (
        <span className="flex items-center gap-1 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-md">
          <Clock className={`h-4 w-4 ${clockColor}`} />
          {displayDuration} - R$ {earningsPerHourStr}/h
        </span>
      )}
    </div>
  );
}
