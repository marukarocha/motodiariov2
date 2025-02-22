'use client';

import React, { useState, useEffect } from 'react';
import calculateDistance from './calculateDistance';
import { AiOutlineEnvironment } from 'react-icons/ai';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GPSData {
  distance: number;
  lastLocation?: Coordinates;
  tracking: boolean;
  watcherId?: number;
  error?: string; // Adicione um campo para mensagens de erro
}

const GPSDistanceTracker: React.FC = () => {
  const [gpsData, setGpsData] = useState<GPSData>({ distance: 0, tracking: false });

  useEffect(() => {
    const handlePosition = (position: GeolocationPosition) => {
      // ... (código para lidar com a nova posição) ...
    };

    const handleError = (error: GeolocationPositionError) => {
      setGpsData((prev) => ({ ...prev, error: error.message, tracking: false }));
    };

    const startTracking = () => {
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(handlePosition, handleError, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
        setGpsData((prev) => ({ ...prev, watcherId: id, tracking: true }));
      } else {
        setGpsData((prev) => ({ ...prev, error: 'Geolocalização não suportada.', tracking: false }));
      }
    };

    const stopTracking = () => {
      // ... (código para parar o rastreamento) ...
    };

    const toggleTracking = () => {
      if (gpsData.tracking) {
        stopTracking();
      } else {
        startTracking();
      }
    };

    // ... (resto do código) ...
  }, []);

  return (
    <div>
      <button onClick={toggleTracking} className="bg-[#28a745] text-white px-4 py-2 rounded hover:bg-[#228b40]">
        <AiOutlineEnvironment size={20} className="inline mr-2" />
        {gpsData.tracking ? 'Desligar Localização' : 'Ligar Localização'}
      </button>
      <div className="mt-4">
        <p>Total Percorrido: {gpsData.distance.toFixed(2)} km</p>
        {gpsData.error && <p className="text-red-500">{gpsData.error}</p>} {/* Exibe mensagem de erro */}
      </div>
    </div>
  );
};

export default GPSDistanceTracker;
