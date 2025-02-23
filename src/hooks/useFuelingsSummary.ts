// src/hooks/useFuelingsSummary.ts
export interface FuelingsSummaryData {
    totalCost: number;
    totalLiters: number;
    averageCostPerLiter: number;
    totalFuelings: number;
  }
  
  export function useFuelingsSummary(fuelings: { litros: number | string; valorLitro: number | string }[]): FuelingsSummaryData {
    const totalLiters = fuelings.reduce((acc, item) => acc + Number(item.litros), 0);
    const totalCost = fuelings.reduce((acc, item) => acc + Number(item.litros) * Number(item.valorLitro), 0);
    const averageCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
    const totalFuelings = fuelings.length;
    return { totalCost, totalLiters, averageCostPerLiter, totalFuelings };
  }
  