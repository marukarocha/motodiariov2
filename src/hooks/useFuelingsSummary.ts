// src/hooks/useFuelingsSummary.ts

export interface FuelingsSummaryData {
  totalCost: number;
  totalLiters: number;
  averageCostPerLiter: number;
  totalFuelings: number;
  fuelAvailable: number; // Litros disponíveis no tanque
  kilometersRemaining: number; // Quilômetros restantes com o combustível disponível
}

/**
 * Calcula o resumo dos abastecimentos e, se os dados de configuração e o último odômetro forem fornecidos,
 * calcula também o combustível disponível e os quilômetros restantes.
 *
 * @param fuelings - Array de abastecimentos. Cada item deve conter os campos: litros, valorLitro e, opcionalmente, currentMileage.
 * @param config - Objeto de configuração da bike, com os campos: tankVolume e averageConsumption.
 * @param lastOdometer - A leitura do último registro de odômetro.
 * @returns Um objeto contendo o resumo e os cálculos adicionais.
 */
export function useFuelingsSummary(
  fuelings: { litros: number | string; valorLitro: number | string; currentMileage?: number }[],
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
  
  // Se os dados de configuração e o último odômetro existirem, calcula o combustível disponível.
  if (config && lastOdometer && fuelings.length > 0) {
    // Busca o abastecimento com a maior leitura de odômetro
    const lastFueling = fuelings.reduce((acc, curr) => {
      const accMileage = acc && acc.currentMileage !== undefined ? Number(acc.currentMileage) : 0;
      const currMileage = curr && curr.currentMileage !== undefined ? Number(curr.currentMileage) : 0;
      return currMileage > accMileage ? curr : acc;
    }, undefined);

    if (lastFueling && lastFueling.currentMileage !== undefined) {
      const lastFuelingMileage = Number(lastFueling.currentMileage);
      const lastLitrosAbastecidos = Number(lastFueling.litros);

      // Calcula quanto combustível foi usado desde o último abastecimento
      const fuelUsed = (lastOdometer - lastFuelingMileage) / config.averageConsumption;

      // Calcula o que ainda resta no tanque
      fuelAvailable = lastLitrosAbastecidos - fuelUsed;
      if (fuelAvailable < 0) fuelAvailable = 0;

      kilometersRemaining = fuelAvailable * config.averageConsumption;
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
