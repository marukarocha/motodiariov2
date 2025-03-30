"use client";
import React, { useState, ChangeEvent } from "react";
import { getSuggestions } from "@/app/services/mapboxService";
import { computeBbox, isInsideBbox } from "@/utils/geoUtils";

export interface RouteData {
  origin: string;
  destination: string;
}

interface RouteFormProps {
  routeData: RouteData;
  setRouteData: (data: RouteData) => void;
  calculateRoute: () => void;
  userLocation: [number, number] | null; // se tivermos o GPS do usuário
  radiusKm?: number; // default 150
}

const RouteForm: React.FC<RouteFormProps> = ({
  routeData,
  setRouteData,
  calculateRoute,
  userLocation,
  radiusKm = 150
}) => {
  // Armazena as features retornadas (para extrair coords e place_name).
  const [features, setFeatures] = useState<any[]>([]);
  const [activeField, setActiveField] = useState<"origin" | "destination" | null>(null);

  // Ao digitar no input de origem/destino
  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
    field: "origin" | "destination"
  ) => {
    const value = e.target.value;
    setActiveField(field);

    setRouteData({ ...routeData, [field]: value });

    // Gera bounding box com base no GPS
    let bbox: [number, number, number, number] | undefined;
    if (userLocation) {
      bbox = computeBbox(userLocation[0], userLocation[1], radiusKm);
    }

    if (value.length > 2) {
      try {
        const fts = await getSuggestions(value, bbox);
        setFeatures(fts); // guardamos as features completas
      } catch (err) {
        console.error("Erro ao buscar sugestões:", err);
        setFeatures([]);
      }
    } else {
      setFeatures([]);
    }
  };

  // Quando clica numa sugestão
  const handleSelectSuggestion = (idx: number) => {
    if (!activeField) return;

    const feat = features[idx];
    if (!feat) return;

    // coords [lng, lat]
    const coords = feat.geometry.coordinates as [number, number];
    const placeName = feat.place_name as string;

    // Se quisermos checar bounding box novamente, mesmo que o Mapbox já filtrou
    if (userLocation) {
      const bbox = computeBbox(userLocation[0], userLocation[1], radiusKm);
      if (!isInsideBbox(coords, bbox)) {
        alert(`Local fora do raio de ${radiusKm} km!`);
        return;
      }
    }

    // Se OK, atualiza o RouteData
    setRouteData({ ...routeData, [activeField]: placeName });

    // Limpa a lista de sugestões
    setFeatures([]);
  };

  return (
    <div className="space-y-4">
      {/* Origem */}
      <div>
        <label>Origem</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={routeData.origin}
          onChange={(e) => handleInputChange(e, "origin")}
        />
        {activeField === "origin" && features.length > 0 && (
          <ul className="border shadow max-h-40 overflow-auto">
            {features.map((ft, i) => (
              <li
                key={i}
                className="p-2 hover:bg-gray-900 cursor-pointer text-sm"
                onClick={() => handleSelectSuggestion(i)}
              >
                {ft.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Destino */}
      <div>
        <label>Destino</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={routeData.destination}
          onChange={(e) => handleInputChange(e, "destination")}
        />
        {activeField === "destination" && features.length > 0 && (
          <ul className="border shadow max-h-40 overflow-auto">
            {features.map((ft, i) => (
              <li
                key={i}
                className="p-2 hover:bg-gray-900 cursor-pointer text-sm"
                onClick={() => handleSelectSuggestion(i)}
              >
                {ft.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={calculateRoute} className="bg-blue-500 text-white px-4 py-2 rounded">
        Calcular Rota
      </button>
    </div>
  );
};

export default RouteForm;
