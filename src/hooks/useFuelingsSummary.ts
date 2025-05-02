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
 * Calcula o resumo de abastecimentos considerando:
 * - litros acumulados desde o último fullTank
 * - se o fullTank não for encontrado, começa do primeiro registro
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

  if (config && typeof lastOdometer === "number" && fuelings.length > 0) {
    // Filtra e ordena por odômetro crescente
    const sorted = [...fuelings]
      .filter(f => f.currentMileage !== undefined)
      .sort((a, b) => Number(a.currentMileage) - Number(b.currentMileage));

    // Busca o último abastecimento com tanque cheio
    let referenceIndex = -1;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].fullTank) {
        referenceIndex = i;
        break;
      }
    }

    let baseMileage = 0;
    let initialLiters = 0;

    if (referenceIndex >= 0) {
      // Último tanque cheio como referência
      const ref = sorted[referenceIndex];
      baseMileage = Number(ref.currentMileage);
      initialLiters = config.tankVolume;

      // Soma todos os litros após o tanque cheio
      const after = sorted.slice(referenceIndex + 1);
      const sumLitros = after.reduce((acc, f) => acc + Number(f.litros), 0);
      initialLiters += sumLitros;
    } else {
      // Nenhum tanque cheio: usa o primeiro abastecimento como base
      const ref = sorted[0];
      baseMileage = Number(ref.currentMileage);
      initialLiters = sorted.reduce((acc, f) => acc + Number(f.litros), 0);
    }

    const kmPercorridos = lastOdometer - baseMileage;
    const litrosUsados = kmPercorridos / config.averageConsumption;

    fuelAvailable = initialLiters - litrosUsados;
    fuelAvailable = Math.max(0, Math.min(fuelAvailable, config.tankVolume));
    kilometersRemaining = fuelAvailable * config.averageConsumption;
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
