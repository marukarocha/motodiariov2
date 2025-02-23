// src/lib/maintenanceCalculator.ts
export interface MaintenanceConfig {
    oilChangeInterval: number; // Ex: 1500 km
    initialMileage: number;    // Km inicial da moto
  }
  
  export function calculateNextOilChange(currentMileage: number, config: MaintenanceConfig): number {
    // Calcula o próximo ciclo de manutenção baseado no intervalo
    const cycles = Math.floor((currentMileage - config.initialMileage) / config.oilChangeInterval) + 1;
    return config.initialMileage + cycles * config.oilChangeInterval;
  }
  
  // Exemplo de uso:
  // Se a moto foi registrada com 10.000 km e o intervalo é 1500 km,
  // e o usuário já rodou 11.200 km, então:
  const config: MaintenanceConfig = { oilChangeInterval: 1500, initialMileage: 10000 };
  const nextChange = calculateNextOilChange(11200, config);
  // nextChange seria 11500 (ou 11500 km)
  