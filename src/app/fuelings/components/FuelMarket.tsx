// src/app/fuelings/FuelMarket.tsx

import React from 'react';
import { Fueling, Earning } from "@/types/types"; // Importa os tipos centralizados

interface FuelMarketProps {
  fuelings: Fueling[];
  earnings?: Earning[];
}

const FuelMarket = ({ fuelings, earnings = [] }: FuelMarketProps) => {
  if (!fuelings || fuelings.length === 0) {
    return (
      <div className="fuel-market">
        <h2>Fuel Market</h2>
        <p>Não há registros de abastecimento.</p>
      </div>
    );
  }

  // Usa o último abastecimento como referência
  const lastFueling = fuelings[fuelings.length - 1];
  const fuelingDate = new Date(lastFueling.data);

  // Filtra os earnings que ocorreram após o último abastecimento
  const earningsAfterFueling = earnings.filter(e => new Date(e.data) > fuelingDate);

  if (earningsAfterFueling.length < 2) {
    return (
      <div className="fuel-market">
        <h2>Fuel Market</h2>
        <p>
          Dados insuficientes de earnings após o último abastecimento para calcular a quilometragem rodada e o consumo médio.
        </p>
      </div>
    );
  }

  // Ordena os earnings após o abastecimento por data (crescente)
  const sortedEarnings = [...earningsAfterFueling].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  const initialEarning = sortedEarnings[0];
  const currentEarning = sortedEarnings[sortedEarnings.length - 1];

  const distance = currentEarning.km - initialEarning.km;
  const consumption = distance > 0 ? lastFueling.litros / distance : 0;

  return (
    <div className="fuel-market">
      <h2>Fuel Market</h2>
      <p>
        <strong>Distância rodada:</strong> {distance} km
      </p>
      <p>
        <strong>Consumo médio:</strong> {consumption.toFixed(2)} litros/km
      </p>
      {/* Visualização adicional (ex: gauge) pode ser adicionada aqui */}
    </div>
  );
};

export default FuelMarket;
