// components/Filters.tsx
'use client';

import React from 'react';

export default function Filters() {
  return (
    <div className="bg-neutral-900 p-4 rounded text-sm">
      <h2 className="text-lg font-bold mb-2">Resumo do Dia</h2>
      <p className="text-muted mb-1">Filtros (simulação)</p>
      <div className="space-y-2">
        <label className="block">
          <input type="checkbox" className="mr-2" />
          Corrida
        </label>
        <label className="block">
          <input type="checkbox" className="mr-2" />
          Bate lata
        </label>
        <label className="block">
          <input type="checkbox" className="mr-2" />
          Parado
        </label>
      </div>
    </div>
  );
}
