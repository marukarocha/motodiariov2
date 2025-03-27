// src/app/profile/components/map/Map.tsx
import React, { FC, useEffect } from 'react';
import { useMapbox } from '@/hooks/UseMapBox';
import mapboxgl from 'mapbox-gl';

interface MapProps {
  onMapLoad?: (map: mapboxgl.Map) => void;
}

const Map: FC<MapProps> = ({ onMapLoad }) => {
  const { mapContainer, mapRef, mapInitialized } = useMapbox();

  useEffect(() => {
    if (mapInitialized && mapRef.current && onMapLoad) {
      onMapLoad(mapRef.current);
    }
  }, [mapInitialized, mapRef, onMapLoad]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Map;
