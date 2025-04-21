// src/hooks/useFuelingsSummary.ts

export interface FuelingsSummaryData {
  totalCost: number;
  totalLiters: number;
  averageCostPerLiter: number;
  totalFuelings: number;
  fuelAvailable: number;
  kilometersRemaining: number;
}

/**
 * Calcula resumo de abastecimentos,
 * usando fullTank como base para precisão.
 */
export function useFuelingsSummary(
  fuelings: {
    litros: number | string;
    valorLitro: number | string;
    currentMileage?: number;
    fullTank?: boolean;
  }[],
  config?: { tankVolume: number; averageConsumption: number },
  lastOdometer?: number
): FuelingsSummaryData {
  const totalLiters = fuelings.reduce((acc, item) => acc + Number(item.litros), 0);
  const totalCost = fuelings.reduce(
    (acc, item) => acc + Number(item.litros) * Number(item.valorLitro),
    0
  );
  const averageCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
  const totalFuelings = fuelings.length;

  let fuelAvailable = 0;
  let kilometersRemaining = 0;

  if (config && lastOdometer && fuelings.length > 0) {
    const sorted = [...fuelings]
      .filter(f => f.currentMileage !== undefined)
      .sort((a, b) => Number(a.currentMileage) - Number(b.currentMileage));

    const fullTanks = sorted.filter(f => f.fullTank);
    const reference = fullTanks.length > 0
      ? fullTanks[fullTanks.length - 1]
      : sorted[sorted.length - 1];

    if (reference && reference.currentMileage !== undefined) {
      const kmSince = lastOdometer - Number(reference.currentMileage);
      const averageConsumption = config.averageConsumption;
      const usedLiters = kmSince / averageConsumption;

      const initialLiters = reference.fullTank
        ? config.tankVolume
        : Number(reference.litros);

      fuelAvailable = initialLiters - usedLiters;
      fuelAvailable = Math.max(0, Math.min(fuelAvailable, config.tankVolume));
      kilometersRemaining = fuelAvailable * averageConsumption;
    }
  }

  return {
    totalCost,
    totalLiters,
    averageCostPerLiter,
    totalFuelings,
    fuelAvailable,
    kilometersRemaining,
  };
}
