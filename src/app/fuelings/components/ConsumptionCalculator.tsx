'use client';

import React from 'react';

export interface ConsumptionCalculatorProps {
  valorLitro: number;        // Preço do litro de combustível (ex.: 6.52)
  consumoMedio: number;       // Consumo médio em km/L (ex.: 39)
  tanqueCapacity: number;     // Capacidade do tanque em litros (ex.: 12)
  tripDistance?: number;      // (Opcional) Distância da corrida em km para cálculo do custo
  oilChangeCostPerInterval?: number;  // Custo da troca de óleo (ex.: 40) a cada...
  oilChangeInterval?: number;         // ...intervalo de km (ex.: 1500)
  maintenanceCostPerMonth?: number;   // Custo de manutenção mensal (ex.: 300)
  estimatedMonthlyKm?: number;        // Estimativa de km rodados por mês (ex.: 1500)
}

export const calculateCostPerKm = (
  valorLitro: number,
  consumoMedio: number
): number => {
  return valorLitro / consumoMedio;
};

export const calculateTripCost = (
  distance: number,
  valorLitro: number,
  consumoMedio: number
): number => {
  return distance * calculateCostPerKm(valorLitro, consumoMedio);
};

export const calculateAutonomy = (
  consumoMedio: number,
  tanqueCapacity: number
): number => {
  return consumoMedio * tanqueCapacity;
};

export const calculateOilCostPerKm = (
  oilChangeCost: number,
  oilChangeInterval: number
): number => {
  return oilChangeCost / oilChangeInterval;
};

export const calculateMaintenanceCostPerKm = (
  maintenanceCost: number,
  estimatedMonthlyKm: number
): number => {
  return maintenanceCost / estimatedMonthlyKm;
};

const ConsumptionCalculator: React.FC<ConsumptionCalculatorProps> = ({
  valorLitro,
  consumoMedio,
  tanqueCapacity,
  tripDistance,
  oilChangeCostPerInterval = 40,
  oilChangeInterval = 1500,
  maintenanceCostPerMonth = 300,
  estimatedMonthlyKm = 1500,
}) => {
  const fuelCostPerKm = calculateCostPerKm(valorLitro, consumoMedio);
  const tripCost = tripDistance !== undefined
    ? calculateTripCost(tripDistance, valorLitro, consumoMedio)
    : null;
  const autonomy = calculateAutonomy(consumoMedio, tanqueCapacity);
  const oilCostPerKm = calculateOilCostPerKm(oilChangeCostPerInterval, oilChangeInterval);
  const maintenanceCostPerKm = calculateMaintenanceCostPerKm(maintenanceCostPerMonth, estimatedMonthlyKm);
  const totalCostPerKm = fuelCostPerKm + oilCostPerKm + maintenanceCostPerKm;

  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-1 sm:grid-cols-1 gap-2">
        <li className="flex items-center">
          <strong className="mr-2 text-lg">Custo por km (combustível):</strong>
          <span className="inline-block bg-blue-500 text-white text-sm font-semibold rounded-full px-4 py-1">{`R$ ${fuelCostPerKm.toFixed(2)}`}</span>
        </li>
        <li className="flex items-center">
          <strong className="mr-2 text-lg">Autonomia com tanque cheio:</strong>
          <span className="inline-block bg-teal-500 text-white text-sm font-semibold rounded-full px-4 py-1">{`${autonomy.toFixed(0)} km`}</span>
        </li>
        {tripDistance !== undefined && (
          <li className="flex items-center">
            <strong className="mr-2 text-lg">Custo para uma corrida de {tripDistance} km:</strong>
            <span className="inline-block bg-yellow-500 text-white text-sm font-semibold rounded-full px-4 py-1">{`R$ ${tripCost?.toFixed(2)}`}</span>
          </li>
        )}
        <li className="flex items-center">
          <strong className="mr-2 text-lg">Custo por km (óleo):</strong>
          <span className="inline-block bg-gray-500 text-white text-sm font-semibold rounded-full px-4 py-1">{`R$ ${oilCostPerKm.toFixed(2)}`}</span>
        </li>
        <li className="flex items-center">
          <strong className="mr-2 text-lg">Custo por km (manutenção):</strong>
          <span className="inline-block bg-indigo-500 text-white text-sm font-semibold rounded-full px-4 py-1">{`R$ ${maintenanceCostPerKm.toFixed(2)}`}</span>
        </li>
        <li className="flex items-center">
          <strong className="mr-2 text-lg">Custo total por km:</strong>
          <span className="inline-block bg-red-500 text-white text-sm font-semibold rounded-full px-4 py-1">{`R$ ${totalCostPerKm.toFixed(2)}`}</span>
        </li>
      </ul>
    </div>
  );
};

export default ConsumptionCalculator;
