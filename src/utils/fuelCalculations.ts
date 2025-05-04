// src/utils/fuelCalculations.ts

import { Fueling } from "@/types/types";

/**
 * Converte qualquer valor em número seguro (NaN -> 0).
 */
const safeNum = (value: any): number => {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
};

/**
 * Calcula o custo por km considerando o valor do litro e o consumo médio.
 */
export const calculateCostPerKm = (
  valorLitro: number,
  consumoMedio: number
): number => safeNum(valorLitro) / safeNum(consumoMedio);

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
): number => safeNum(consumoMedio) * safeNum(tanqueCapacity);

/**
 * Calcula o custo por km relacionado à troca de óleo.
 */
export const calculateOilCostPerKm = (
  oilChangeCost: number,
  oilChangeInterval: number
): number => safeNum(oilChangeCost) / safeNum(oilChangeInterval);

/**
 * Calcula o custo de manutenção por km.
 */
export const calculateMaintenanceCostPerKm = (
  maintenanceCost: number,
  estimatedMonthlyKm: number
): number => safeNum(maintenanceCost) / safeNum(estimatedMonthlyKm);

/**
 * Calcula a média de consumo (km/l) entre os dois últimos eventos fullTank.
 * Se houver menos de 2 fullTank, usa os dois registros mais recentes.
 */
export function calculateAverageConsumptionFromFuelings(
  fuelings: Fueling[],
  limit: number
): number {
  if (fuelings.length < 2) return 0;

  // 1) Ordena por odômetro crescente
  const sorted = [...fuelings]
    .filter(f => f.currentMileage !== undefined && f.litros !== undefined)
    .sort((a, b) => safeNum(a.currentMileage) - safeNum(b.currentMileage));

  // 2) Encontra índices dos dois últimos fullTank
  const fullIndices: number[] = [];
  sorted.forEach((f, i) => {
    if (f.fullTank) fullIndices.push(i);
  });

  let startIdx: number, endIdx: number;

  if (fullIndices.length >= 2) {
    // pega os dois últimos
    endIdx = fullIndices.pop()!;
    startIdx = fullIndices.pop()!;
  } else {
    // fallback: usa os dois últimos registros quaisquer
    endIdx = sorted.length - 1;
    startIdx = Math.max(0, sorted.length - 2);
  }

  const start = sorted[startIdx]!;
  const end = sorted[endIdx]!;

  const kmTraveled = safeNum(end.currentMileage) - safeNum(start.currentMileage);
  if (kmTraveled <= 0) return 0;

  // 3) Soma todos os litros abastecidos entre startIdx (exclusive) e endIdx (inclusive)
  let litersSum = 0;
  for (let i = startIdx + 1; i <= endIdx; i++) {
    litersSum += safeNum(sorted[i].litros);
  }
  if (litersSum <= 0) return 0;

  // 4) Consumo médio
  return kmTraveled / litersSum;
}
