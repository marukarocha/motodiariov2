
// src/hooks/useFuelingsSummary.ts

export interface FuelingsSummaryData {
  totalCost: number;
  totalLiters: number;
  averageCostPerLiter: number;
  totalFuelings: number;
  fuelAvailable: number;       // Litros disponíveis no tanque
  kilometersRemaining: number; // Autonomia estimada (km)
  averageConsumption: number;  // Consumo médio utilizado (km/L)
}

/**
 * Hook que calcula o resumo de abastecimentos:
 * - Custo total, litros totais, custo médio por litro
 * - Consumo médio (dinâmico ou config)
 * - Combustível disponível e autonomia, com base no último fullTank ou último registro
 *
 * @param fuelings - Lista de abastecimentos com campos: litros, valorLitro, currentMileage, fullTank
 * @param config - Configuração da bike: tankVolume e averageConsumption (fallback)
 * @param lastOdometer - Última leitura de odômetro
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
  // Sumarização básica
  const totalLiters = fuelings.reduce((sum, f) => sum + Number(f.litros), 0);
  const totalCost = fuelings.reduce((sum, f) => sum + Number(f.litros) * Number(f.valorLitro), 0);
  const averageCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
  const totalFuelings = fuelings.length;

  // Ordena registros por odômetro
  const sorted = [...fuelings]
    .filter(f => f.currentMileage !== undefined)
    .sort((a, b) => Number(a.currentMileage) - Number(b.currentMileage));

  // Define o consumo médio: dinâmico se possível, senão configurado
  let averageConsumption = config?.averageConsumption ?? 0;
  if (sorted.length >= 2) {
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const kmTotal = Number(last.currentMileage) - Number(first.currentMileage);
    const litersSum = sorted.slice(0, -1).reduce((sum, f) => sum + Number(f.litros), 0);
    averageConsumption = litersSum > 0 ? kmTotal / litersSum : averageConsumption;
  }

  // Calcula combustível disponível e autonomia
  let fuelAvailable = 0;
  let kilometersRemaining = 0;
  if (config && lastOdometer !== undefined && averageConsumption > 0) {
    // Busca último fullTank, senão último registro
    const refList = sorted.filter(f => f.currentMileage !== undefined);
    const fulls = refList.filter(f => f.fullTank);
    const reference = fulls.length > 0 ? fulls[0] : refList[refList.length - 1];

    if (reference && reference.currentMileage !== undefined) {
      const kmSince = lastOdometer - Number(reference.currentMileage);
      const usedLiters = kmSince / averageConsumption;

      // Se marcado fullTank, parte do tanque cheio, senão apenas dos litros abastecidos
      const baseLiters = reference.fullTank ? config.tankVolume : Number(reference.litros);
      fuelAvailable = baseLiters - usedLiters;
      if (fuelAvailable < 0) fuelAvailable = 0;

      kilometersRemaining = fuelAvailable * averageConsumption;
    }
  }

  return {
    totalCost,
    totalLiters,
    averageCostPerLiter,
    totalFuelings,
    averageConsumption,
    fuelAvailable,
    kilometersRemaining,
  };
}
