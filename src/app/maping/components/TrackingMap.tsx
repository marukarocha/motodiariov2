// components/TrackingMap.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONSourceRaw } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { format } from 'date-fns';
import { db } from '@/lib/db/firebaseServices';
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { calcularDistanciaTotal, calcularVelocidadeMedia } from '@/utils/geoUtils';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface GpsLog {
  latitude: number;
  longitude: number;
  speed: number;
  createdAt: any;
}

export default function TrackingMap() {
  const [logs, setLogs] = useState<GpsLog[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [distancia, setDistancia] = useState(0);
  const [mediaVelocidade, setMediaVelocidade] = useState(0);
  const [tempoTotal, setTempoTotal] = useState(0);
  const [tempoParado, setTempoParado] = useState(0);
  const [animar, setAnimar] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const uid = '8Os7jlITY1akOK3dV16LKE3hYUD2';
      const dataStr = format(dataSelecionada, 'yyyy-MM-dd');
      const colRef = collection(db, 'users', uid, 'gpsLogs', dataStr, dataStr);
      const q = query(colRef, orderBy('createdAt'));
      const snapshot = await getDocs(q);
      const dados = snapshot.docs.map(doc => ({ ...doc.data(), createdAt: doc.data().createdAt })) as GpsLog[];
      setLogs(dados);

      const emMovimento = dados.filter(p => p.speed > 1);
      const totalKm = calcularDistanciaTotal(emMovimento);
      const media = calcularVelocidadeMedia(emMovimento);

      const inicioMov = emMovimento[0]?.createdAt?.toDate?.();
      const fimMov = emMovimento.at(-1)?.createdAt?.toDate?.();
      const inicio = dados[0]?.createdAt?.toDate?.();
      const fim = dados.at(-1)?.createdAt?.toDate?.();

      const tRodado = inicioMov && fimMov ? (fimMov.getTime() - inicioMov.getTime()) / 3600000 : 0;
      const tParado = inicio && fim ? (fim.getTime() - inicio.getTime()) / 3600000 - tRodado : 0;

      setDistancia(totalKm);
      setMediaVelocidade(media);
      setTempoTotal(tRodado);
      setTempoParado(tParado);
    };

    fetchLogs();
  }, [dataSelecionada]);

  useEffect(() => {
    if (!mapContainer.current || logs.length === 0) return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [logs[0].longitude, logs[0].latitude] as [number, number],
      zoom: 12,
    });

    mapRef.current = map;

    map.on('load', () => {
      const routeCoords = logs.map(p => [p.longitude, p.latitude] as [number, number]);

      map.addSource('route', {
        type: 'geojson',
        lineMetrics: true,
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
          properties: {},
        },
      } as GeoJSONSourceRaw);

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-width': 5,
          'line-gradient': [
            'interpolate', ['linear'], ['line-progress'],
            0, '#00ff00',
            0.5, '#00ffff',
            1, '#ff0000'
          ]
        }
      });

      let animCoords: [number, number][] = [];
      let i = 0;

      if (animar) {
        const newInterval = setInterval(() => {
          if (isPaused) return;

          if (i >= logs.length) {
            if (intervalId) clearInterval(intervalId);
            return;
          }

          animCoords.push([logs[i].longitude, logs[i].latitude]);
          const source = map.getSource('route') as mapboxgl.GeoJSONSource;
          source.setData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: animCoords,
            },
            properties: {},
          });

          if (i % 10 === 0 || i === 0) {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.background = getMarkerColor(i / logs.length);
            el.style.color = '#000';
            el.style.borderRadius = '50%';
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.fontWeight = 'bold';
            el.style.boxShadow = '0 0 4px #fff';
            el.innerText = i.toString();
            new mapboxgl.Marker(el).setLngLat([logs[i].longitude, logs[i].latitude] as [number, number]).addTo(map);
          }

          i++;
        }, 50);

        setIntervalId(newInterval);
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        routeCoords.forEach((coord, index) => {
          bounds.extend(coord);
          if (index % 10 === 0 || index === 0) {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.background = getMarkerColor(index / logs.length);
            el.style.color = '#000';
            el.style.borderRadius = '50%';
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.fontWeight = 'bold';
            el.style.boxShadow = '0 0 4px #fff';
            el.innerText = index.toString();
            new mapboxgl.Marker(el).setLngLat(coord as [number, number]).addTo(map);
          }
        });

        const source = map.getSource('route') as mapboxgl.GeoJSONSource;
        source.setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: routeCoords,
          },
          properties: {},
        });

        map.fitBounds(bounds, { padding: 40 });
      }
    });
  }, [logs, animar, isPaused]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="col-span-8">
        <div className="flex items-center gap-4 mb-2">
          <label htmlFor="data">Selecionar data:</label>
          <input
            id="data"
            type="date"
            value={format(dataSelecionada, 'yyyy-MM-dd')}
            onChange={e => setDataSelecionada(new Date(e.target.value))}
            className="bg-black text-white border border-neutral-700 rounded px-2"
          />
          <button
            onClick={() => setAnimar(true)}
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >Iniciar</button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >{isPaused ? 'Continuar' : 'Pausar'}</button>
          <button
            onClick={() => { setAnimar(false); setLogs([...logs]); setIsPaused(false); }}
            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >Reiniciar</button>
        </div>
        <div ref={mapContainer} className="w-full h-[800px] rounded-lg" />
      </div>

      <div className="col-span-4 bg-neutral-900 p-4 rounded text-sm">
        <h2 className="text-lg font-bold mb-2">Resumo do Dia</h2>
        <p><strong>Pontos:</strong> {logs.length}</p>
        <p><strong>Distância:</strong> {distancia.toFixed(2)} km</p>
        <p><strong>Velocidade média:</strong> {mediaVelocidade.toFixed(1)} km/h</p>
        <p><strong>Tempo rodando:</strong> {tempoTotal.toFixed(2)} h</p>
        <p><strong>Tempo parado:</strong> {tempoParado.toFixed(2)} h</p>
        <hr className="my-3 border-neutral-800" />
        <p className="text-muted">Filtros (simulação)</p>
        <label className="block"><input type="checkbox" className="mr-2" />Corrida</label>
        <label className="block"><input type="checkbox" className="mr-2" />Bate lata</label>
        <label className="block"><input type="checkbox" className="mr-2" />Parado</label>
      </div>
    </div>
  );
}

function getMarkerColor(value: number) {
  const r = Math.floor(255 * value);
  const g = Math.floor(255 * (1 - value));
  return `rgb(${r},${g},100)`;
}
