'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface PerformanceThermometerProps {
  amount: number;
  mileage: number;
  duration?: number; // Tempo da corrida em horas
}

export default function PerformanceThermometer({ amount, mileage, duration }: PerformanceThermometerProps) {
  if (mileage === 0) return <p className="text-sm text-gray-500">Sem dados</p>;

  // Calcula a taxa de ganho por KM
  const earningsPerKm = amount / mileage;

  // Calcula a taxa de ganho por hora
  const earningsPerHour = duration ? (amount / duration).toFixed(2) : 'N/A';

  // Normaliza a porcentagem para escala de 0% a 100%
  const percentage = Math.min(Math.max((earningsPerKm / 2) * 100, 0), 100);

  // Função para interpolar cores entre vermelho -> amarelo -> verde -> verde limão
  const getColorFromPercentage = (percentage: number) => {
    if (percentage <= 33) {
      // Vermelho → Amarelo
      const red = 255;
      const green = Math.round((percentage / 33) * 255);
      return `rgb(${red}, ${green}, 0)`;
    } else if (percentage <= 66) {
      // Amarelo → Verde
      const red = Math.round(255 - ((percentage - 33) / 33) * 255);
      const green = 255;
      return `rgb(${red}, ${green}, 0)`;
    } else {
      // Verde → Verde Limão
      const green = 255;
      const blue = Math.round(((percentage - 66) / 34) * 159); // Até verde limão (159 no azul)
      return `rgb(0, ${green}, ${blue})`;
    }
  };

  // Cor sólida gerada dinamicamente
  const solidColor = getColorFromPercentage(percentage);

  return (
    <div className="flex items-center gap-2">
      {/* Barra de desempenho */}
      <div className="relative w-40 h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#10101B' }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: solidColor, // Cor única gerada dinamicamente
          }}
        />
      </div>

      {/* Badge R$/KM */}
      <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-md">
        {earningsPerKm.toFixed(2)} R$/KM
      </span>

      {/* Badge Valor por Hora */}
      {duration && (
        <span className="flex items-center gap-1 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-md">
          <Clock className="h-4 w-4 text-yellow-300" /> R$ {earningsPerHour}/h
        </span>
      )}
    </div>
  );
}
