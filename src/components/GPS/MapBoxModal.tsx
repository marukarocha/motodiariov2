'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!; // ✅ do .env

interface SimpleMapModalProps {
  lat: number;
  lon: number;
  onClose: () => void;
}

export function SimpleMapModal({ lat, lon, onClose }: SimpleMapModalProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [lon, lat],
      zoom: 14,
    });

    new mapboxgl.Marker().setLngLat([lon, lat]).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lon]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
      <div className="relative w-[90vw] max-w-2xl h-[500px] bg-black border border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-white text-xl hover:text-red-400"
        >
          ×
        </button>

        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
