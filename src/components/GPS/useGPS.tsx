'use client';

import { useState, useCallback } from 'react';

interface GPSLocation {
  latitude: number;
  longitude: number;
}

interface GPSResult {
  location?: GPSLocation;
  error?: string;
  loading: boolean;
  permissionDenied: boolean;
  requestLocation: () => void;
}

export const useGPS = (): GPSResult => {
  const [gpsData, setGpsData] = useState<GPSResult>({ loading: false, permissionDenied: false });

  const requestLocation = useCallback(() => {
    setGpsData(prev => ({ ...prev, loading: true }));

    const handleSuccess = (position: GeolocationPosition) => {
      setGpsData({
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        loading: false,
        permissionDenied: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Erro ao obter localização.';
      let permissionDenied = false;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Usuário negou acesso à localização.';
          permissionDenied = true;
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Localização indisponível.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Tempo limite para obter localização.';
          break;
      }
      setGpsData({ error: errorMessage, loading: false, permissionDenied });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
      setGpsData({ error: 'Geolocalização não suportada.', loading: false, permissionDenied: false });
    }
  }, []);

  return { ...gpsData, requestLocation };
};
