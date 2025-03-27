"use client";
import React, { FC, ChangeEvent, useState } from 'react';
import { getSuggestions } from '@/app/services/mapboxService';

export interface RouteData {
  origin: string;
  destination: string;
}

interface RouteFormProps {
  routeData: RouteData;
  setRouteData: (data: RouteData) => void;
  calculateRoute: () => void;
  userLocation: [number, number] | null;
}

const getBoundingBox = (center: [number, number], radiusKm: number): [number, number, number, number] => {
  const [lng, lat] = center;
  const latDiff = radiusKm / 111; // Aproximadamente 1° latitude ≈ 111 km
  const lngDiff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return [lng - lngDiff, lat - latDiff, lng + lngDiff, lat + latDiff];
};

const RouteForm: FC<RouteFormProps> = ({ routeData, setRouteData, calculateRoute, userLocation }) => {
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const defaultRadius = 150; // Raio de busca definido internamente (150 km)
  const MIN_QUERY_LENGTH = 3;

  const handleOriginChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRouteData({ ...routeData, origin: value });
    if (value && userLocation && value.trim().length >= MIN_QUERY_LENGTH) {
      try {
        const bbox = getBoundingBox(userLocation, defaultRadius);
        const suggestions = await getSuggestions(value, bbox);
        console.log("Sugestões de origem:", suggestions);
        setOriginSuggestions(suggestions);
      } catch (error) {
        console.error("Erro ao buscar sugestões de origem:", error);
        setOriginSuggestions([]);
      }
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestinationChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRouteData({ ...routeData, destination: value });
    if (value && userLocation && value.trim().length >= MIN_QUERY_LENGTH) {
      try {
        const bbox = getBoundingBox(userLocation, defaultRadius);
        const suggestions = await getSuggestions(value, bbox);
        console.log("Sugestões de destino:", suggestions);
        setDestinationSuggestions(suggestions);
      } catch (error) {
        console.error("Erro ao buscar sugestões de destino:", error);
        setDestinationSuggestions([]);
      }
    } else {
      setDestinationSuggestions([]);
    }
  };

  const handleSelectOrigin = (placeName: string) => {
    setRouteData({ ...routeData, origin: placeName });
    setOriginSuggestions([]);
  };

  const handleSelectDestination = (placeName: string) => {
    setRouteData({ ...routeData, destination: placeName });
    setDestinationSuggestions([]);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rota</h2>
      <div className="mb-3">
        <input
          name="origin"
          className="border p-2 w-full mb-1"
          placeholder="Origem"
          value={routeData.origin}
          onChange={handleOriginChange}
        />
        {originSuggestions.length > 0 && (
          <ul className="border ">
            {originSuggestions.map((sug, idx) => (
              <li
                key={idx}
                className="p-2 cursor-pointer hover:bg-gray-900"
                onClick={() => handleSelectOrigin(sug.place_name)}
              >
                {sug.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-3">
        <input
          name="destination"
          className="border p-2 w-full mb-1"
          placeholder="Destino"
          value={routeData.destination}
          onChange={handleDestinationChange}
        />
        {destinationSuggestions.length > 0 && (
          <ul className="border">
            {destinationSuggestions.map((sug, idx) => (
              <li
                key={idx}
                className="p-2 cursor-pointer hover:bg-gray-900"
                onClick={() => handleSelectDestination(sug.place_name)}
              >
                {sug.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={calculateRoute} className="w-full bg-blue-500 text-white p-2 rounded mb-4">
        Calcular Rota
      </button>
    </div>
  );
};

export default RouteForm;
