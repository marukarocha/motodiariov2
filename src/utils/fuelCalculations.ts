// src/utils/fuelCalculations.ts

import { Fueling } from "@/types/types";

/**
 * Função auxiliar que converte um valor para número.
 * Se o valor não for numérico ou for NaN, retorna 0.
 */
const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Calcula o custo por km considerando o valor do litro e o consumo médio.
 */
export const calculateCostPerKm = (valorLitro: number, consumoMedio: number): number =>
  safeNumber(valorLitro) / safeNumber(consumoMedio);

/**
 * Calcula o custo de uma corrida de uma dada distância.
 */
export const calculateTripCost = (
  distance: number,
  valorLitro: number,
  consumoMedio: number
): number => distance * calculateCostPerKm(valorLitro, consumoMedio);

/**
 * Calcula a autonomia total com um tanque cheio.
 */
export const calculateAutonomy = (
  consumoMedio: number,
  tanqueCapacity: number
): number => safeNumber(consumoMedio) * safeNumber(tanqueCapacity);

/**
 * Calcula o custo por km relacionado à troca de óleo.
 */
export const calculateOilCostPerKm = (
  oilChangeCost: number,
  oilChangeInterval: number
): number => safeNumber(oilChangeCost) / safeNumber(oilChangeInterval);

/**
 * Calcula o custo de manutenção por km.
 */
export const calculateMaintenanceCostPerKm = (
  maintenanceCost: number,
  estimatedMonthlyKm: number
): number => safeNumber(maintenanceCost) / safeNumber(estimatedMonthlyKm);

/**
 * Calcula a média de consumo (km/l) usando os últimos n registros de abastecimento.
 * Assume que cada registro possui:
 *   - currentMileage: número
 *   - litros: número
 *   - data: string que representa a data (por exemplo, "2025-03-19")
 *
 * Retorna 0 se não houver registros suficientes ou se algum valor for inválido.
 */
export const calculateAverageConsumptionFromFuelings = (fuelings: Fueling[], n: number = 4): number => {
  if (fuelings.length < 2) return 0;

  // Ordena os registros por data (crescente)
  const sortedFuelings = [...fuelings].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  // Seleciona os últimos n registros
  const recentFuelings = sortedFuelings.slice(-n);

  // Verifica se todos os registros possuem currentMileage e litros válidos
  if (!recentFuelings.every(f => safeNumber(f.currentMileage) > 0 && safeNumber(f.litros) > 0)) {
    return 0;
  }

  let totalDistance = 0;
  let totalLiters = 0;
  for (let i = 1; i < recentFuelings.length; i++) {
    const prev = recentFuelings[i - 1];
    const curr = recentFuelings[i];
    const distance = safeNumber(curr.currentMileage) - safeNumber(prev.currentMileage);
    totalDistance += distance;
    totalLiters += safeNumber(curr.litros);
  }
  return totalLiters > 0 ? totalDistance / totalLiters : 0;
};
