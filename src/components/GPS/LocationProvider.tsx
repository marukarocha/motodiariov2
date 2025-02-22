'use client';

import { useState, useEffect, ReactNode } from 'react';

interface LocationProviderProps {
  children: ReactNode;
}

const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLoading(false);
            setPermissionDenied(false);
          },
          (error) => {
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
            setError(errorMessage);
            setLoading(false);
            setPermissionDenied(permissionDenied);
          }
        );
      } catch (err) {
        setError('Erro ao solicitar permissão de localização.');
        setLoading(false);
      }
    } else {
      setError('Geolocalização não suportada.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.permissions && !hasRequested) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state !== 'denied') {
          requestLocation();
        } else {
          setError('Usuário negou acesso à localização.');
          setLoading(false);
          setPermissionDenied(true);
        }
        setHasRequested(true);
      });
    } else if (!hasRequested) {
      requestLocation();
      setHasRequested(true);
    }
  }, [hasRequested]);

  return (
    <>
      {loading && <p>Solicitando permissão de localização...</p>}
      {error && (
        <p className="text-red-500">
          {error}
          {permissionDenied && (
            <button onClick={requestLocation} className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
              Ativar Localização
            </button>
          )}
        </p>
      )}
      {!loading && !error && location && children}
      {!loading && !error && !location && !permissionDenied && <p>Aguardando localização...</p>}
    </>
  );
};

export default LocationProvider;
