'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { useGpsStatus } from '@/hooks/useGpsStatus';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFydWsiLCJhIjoiY204bndmdnIwMDBiYTJxb2oydW00emplcSJ9.FO5u9DFzfdDYLY2aVBm4Cg';

export default function LiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const { currentUser } = useAuth();
  const userId = currentUser?.uid || '';
  const { position } = useGpsStatus(userId);

  useEffect(() => {
    if (!mapContainer.current || !position) return;

    const { lat, lon } = position;

    // Criar o mapa uma vez
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [lon, lat],
        zoom: 14,
      });

      markerRef.current = new mapboxgl.Marker().setLngLat([lon, lat]).addTo(mapRef.current);
    } else {
      // Atualizar posição do mapa e marcador
      mapRef.current.setCenter([lon, lat]);
      markerRef.current?.setLngLat([lon, lat]);
    }
  }, [position]);

  return (
    <div className="w-full h-[400px] border border-white rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
