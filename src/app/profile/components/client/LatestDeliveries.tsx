"use client";

import React from "react";

const deliveries = [
  { id: 1, description: "Entrega no centro da cidade", date: "2025-03-20" },
  { id: 2, description: "Entrega no bairro X", date: "2025-03-19" },
  { id: 3, description: "Entrega urgente", date: "2025-03-18" },
];

export default function LatestDeliveries() {
  return (
    <div className="p-4 border rounded-lg shadow-sm ">
      <h2 className="text-xl font-bold mb-4">Últimas Entregas</h2>
      <ul className="space-y-2">
        {deliveries.map((delivery) => (
          <li key={delivery.id} className="text-sm text-gray-100">
            <strong>{delivery.date}:</strong> {delivery.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
