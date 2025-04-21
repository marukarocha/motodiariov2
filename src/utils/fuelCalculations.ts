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
export function calculateAverageConsumptionFromFuelings(
  fuelings: Fueling[],
  limit: number
): number {
  if (fuelings.length < 2) return 0;

  const filtered = [...fuelings]
    .filter((f) => f.fullTank && f.currentMileage !== undefined)
    .slice(-limit);

  // fallback se não houver suficientes com tanque cheio
  const toCalculate =
    filtered.length >= 2
      ? filtered
      : [...fuelings]
          .filter((f) => f.currentMileage !== undefined)
          .slice(-limit);

  if (toCalculate.length < 2) return 0;

  const first = toCalculate[0];
  const last = toCalculate[toCalculate.length - 1];

  const kmTraveled = Number(last.currentMileage) - Number(first.currentMileage);
  const totalLiters = toCalculate
    .slice(0, toCalculate.length - 1)
    .reduce((sum, f) => sum + Number(f.litros), 0);

  return totalLiters > 0 ? kmTraveled / totalLiters : 0;
};
