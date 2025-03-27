// hooks/useMapbox.ts
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapbox = (initialCenter: [number, number] = [-48.5495, -27.5945], zoom: number = 12) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v10', // estilo dark
        center: initialCenter,
        zoom: zoom,
      });
      setMapInitialized(true);
    }
  }, [initialCenter, zoom]);

  return { mapContainer, mapRef, mapInitialized };
};
