import React from 'react';
import { GaugeComponent } from 'react-gauge-component';
import { Fueling } from "@/types/types";
import { calculateAverageConsumptionFromFuelings } from '@/utils/fuelCalculations';
import OdometerUpdateButton from "@/app/odometer/OdometerUpdateButton";

export interface FuelSummaryCardProps {
  fuelings: Fueling[];
  fuelAvailable: number;      // Combustível disponível (litros)
  tankVolume: number;         // Capacidade total do tanque (litros)
  kilometersRemaining: number;// Autonomia estimada (km)
}

export const FuelSummaryCard = ({ fuelings, fuelAvailable, tankVolume, kilometersRemaining }: FuelSummaryCardProps) => {
  if (!fuelings || fuelings.length < 2) {
    return (
      <div className="p-4 border rounded">
        <h2>Fuel Market</h2>
        <p>Não há registros suficientes de abastecimento.</p>
      </div>
    );
  }

  // Ordena os registros por data (campo "date" é um Timestamp)
  const sortedFuelings = [...fuelings].sort(
    (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
  );

  // Calcula a média de consumo usando os 3 últimos registros (ou todos, se houver menos)
  const averageConsumption = sortedFuelings.length >= 3 
    ? calculateAverageConsumptionFromFuelings(sortedFuelings, 3)
    : calculateAverageConsumptionFromFuelings(sortedFuelings, sortedFuelings.length);

  // Calcula o valor médio do combustível entre todos os registros
  const totalFuelPrice = sortedFuelings.reduce((acc, fueling) => acc + Number(fueling.valorLitro), 0);
  const avgFuelPrice = sortedFuelings.length > 0 ? totalFuelPrice / sortedFuelings.length : 0;
  
  // Custo por km = valor médio do combustível / média de consumo (km/l)
  const costPerKm = averageConsumption > 0 ? avgFuelPrice / averageConsumption : 0;

  return (
    <div className="p-1">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
        {/* Coluna 1: Gauge */}
        <div className="flex justify-center">
          <GaugeComponent
            value={fuelAvailable}
            minValue={0}
            maxValue={tankVolume}
            arc={{
              subArcs: [
                { limit: tankVolume * 0.2, color: '#EA4228', showTick: true },
                { limit: tankVolume * 0.4, color: '#F58B19', showTick: true },
                { limit: tankVolume * 0.6, color: '#F5CD19', showTick: true },
                { limit: tankVolume, color: '#5BE12C', showTick: true },
              ],
            }}
            pointer={{
              color: '#345243',
              length: 0.8,
              width: 15,
            }}
            labels={{
              valueLabel: {
                style: { fontSize: 40 },
                formatTextValue: (value) => `${((value / tankVolume) * 100).toFixed(0)}%`,
              },
            }}
            style={{ width: '300px' }}
          />
        </div>
        {/* Coluna 2: Informações e cálculos */}
        <div className="pl-4">
          <p className="text-sm font-medium">Combustivel</p>
                    
          <p className="text-md">
            <span className="text-green-500 font-bold">{fuelAvailable.toFixed(2)}</span> litros disponíveis
          </p>
          <p className="text-md">
            Autonomia de <span className="text-green-500 font-bold">{kilometersRemaining.toFixed(0)}</span> km
          </p>
          <p>
            <strong>Média de consumo:</strong> <span className="text-green-500 font-bold">
              {averageConsumption > 0 ? averageConsumption.toFixed(2) : "N/A"}
            </span> km/l
          </p>
          <p>
            <strong>Custo por km:</strong> <span className="text-green-500 font-bold">
              {costPerKm > 0 ? `R$ ${costPerKm.toFixed(2)}` : "N/A"}
            </span>
          </p>
        </div>
        {/* Coluna 3: Botão de atualização do odômetro */}
        <div className="flex justify-center">
          <OdometerUpdateButton />
        </div>
      </div>
    </div>
  );
};

export default FuelSummaryCard;
