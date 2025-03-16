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
    <div>
      <h3>Consumo e Custos</h3>
      <ul>
        <li>
          <strong>Custo por km (combustível):</strong> R$ {fuelCostPerKm.toFixed(2)}
        </li>
        <li>
          <strong>Autonomia com tanque cheio:</strong> {autonomy.toFixed(0)} km
        </li>
        {tripDistance !== undefined && (
          <li>
            <strong>Custo para uma corrida de {tripDistance} km:</strong> R$ {tripCost?.toFixed(2)}
          </li>
        )}
        <li>
          <strong>Custo por km (óleo):</strong> R$ {oilCostPerKm.toFixed(2)}
        </li>
        <li>
          <strong>Custo por km (manutenção):</strong> R$ {maintenanceCostPerKm.toFixed(2)}
        </li>
        <li>
          <strong>Custo total por km:</strong> R$ {totalCostPerKm.toFixed(2)}
        </li>
      </ul>
    </div>
  );
};

export default ConsumptionCalculator;
