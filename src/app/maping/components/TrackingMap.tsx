'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONSourceRaw } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { format } from 'date-fns';
import { db } from '@/lib/db/firebaseServices';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { calcularDistanciaTotal, calcularVelocidadeMedia, distanciaCoordKm } from '@/utils/geoUtils';
import Filters from './Filters';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface GpsLog {
  latitude: number;
  longitude: number;
  speed: number;
  createdAt: any;
}

const DISTANCIA_MAX_METROS = 800; // Interpolar se salto for maior que isso

async function getInterpolatedRoute(start: [number, number], end: [number, number]) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    return data.routes?.[0]?.geometry?.coordinates || [start, end];
  } catch {
    return [start, end];
  }
}

export default function TrackingMap() {
  const [logs, setLogs] = useState<GpsLog[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  });
  const [distancia, setDistancia] = useState(0);
  const [mediaVelocidade, setMediaVelocidade] = useState(0);
  const [tempoTotal, setTempoTotal] = useState(0);
  const [tempoParado, setTempoParado] = useState(0);
  const [loading, setLoading] = useState(false);

  // Animação
  const [animar, setAnimar] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const animIndex = useRef(0);
  const animCoords = useRef<[number, number][]>([]);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  // Estatísticas e logs
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

  // Monta rota interpolada
  const [coordsInterpoladas, setCoordsInterpoladas] = useState<[number, number][]>([]);
  useEffect(() => {
    let cancel = false;
    async function buildCoords() {
      setLoading(true);
      if (logs.length < 2) {
        setCoordsInterpoladas(logs.map(p => [p.longitude, p.latitude] as [number, number]));
        setLoading(false);
        return;
      }
      let coords: [number, number][] = [];
      for (let i = 0; i < logs.length - 1; i++) {
        const atual = [logs[i].longitude, logs[i].latitude] as [number, number];
        const prox = [logs[i + 1].longitude, logs[i + 1].latitude] as [number, number];
        coords.push(atual);
        const dist = distanciaCoordKm(atual[1], atual[0], prox[1], prox[0]) * 1000;
        if (dist > DISTANCIA_MAX_METROS) {
          const rotaInter = await getInterpolatedRoute(atual, prox);
          coords.push(...rotaInter.slice(1));
        }
      }
      coords.push([logs.at(-1)!.longitude, logs.at(-1)!.latitude]);
      if (!cancel) setCoordsInterpoladas(coords);
      setLoading(false);
    }
    buildCoords();
    return () => { cancel = true };
  }, [logs]);

  // Renderiza só a linha ao carregar (sem markers!)
  useEffect(() => {
    if (!mapContainer.current || logs.length === 0 || coordsInterpoladas.length === 0) return;
    if (mapRef.current) mapRef.current.remove();

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: coordsInterpoladas[0],
      zoom: 12,
    });
    mapRef.current = map;

    map.on('load', () => {
      const bounds = new mapboxgl.LngLatBounds();
      coordsInterpoladas.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 40 });

      map.addSource('route', {
        type: 'geojson',
        lineMetrics: true,
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coordsInterpoladas },
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
    });

    // Reset animação ao trocar de data
    setAnimar(false);
    setIsPaused(false);
    animCoords.current = [];
    animIndex.current = 0;

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [coordsInterpoladas, logs, dataSelecionada]);

  // ANIMAÇÃO: linha + marcadores bounce, nada fora daqui!
  useEffect(() => {
    if (!animar || coordsInterpoladas.length === 0 || !mapRef.current) return;
    if (intervalId.current) clearInterval(intervalId.current);

    const map = mapRef.current;
    const source = map.getSource('route') as mapboxgl.GeoJSONSource;

    animCoords.current = [];
    animIndex.current = 0;
    const createdMarkers: { [k: number]: mapboxgl.Marker } = {};

    intervalId.current = setInterval(() => {
      if (isPaused) return;
      if (animIndex.current >= coordsInterpoladas.length) {
        clearInterval(intervalId.current!);
        return;
      }
      animCoords.current.push(coordsInterpoladas[animIndex.current]);
      source.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: animCoords.current },
        properties: {},
      });

      // Só marca os pontos originais, múltiplos de 10, 0 ou último
      const markerIndex = logs.findIndex(
        (log, i) =>
          log.longitude === coordsInterpoladas[animIndex.current][0] &&
          log.latitude === coordsInterpoladas[animIndex.current][1] &&
          (i % 10 === 0 || i === 0 || i === logs.length - 1)
      );

      if (
        markerIndex !== -1 &&
        !createdMarkers[markerIndex]
      ) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.background = getMarkerColor(markerIndex / logs.length);
        el.style.color = '#000';
        el.style.borderRadius = '50%';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.boxShadow = '0 0 4px #fff';
        el.innerText = markerIndex.toString();

        // BOUNCE
        el.animate(
          [
            { transform: 'scale(0.5)' },
            { transform: 'scale(1.3)' },
            { transform: 'scale(0.95)' },
            { transform: 'scale(1)' },
          ],
          { duration: 450, easing: 'ease-out' }
        );

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordsInterpoladas[animIndex.current])
          .addTo(map);
        createdMarkers[markerIndex] = marker;
      }

      animIndex.current++;
    }, 30);

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [animar, isPaused, coordsInterpoladas, logs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="col-span-8">
        <div className="flex items-center gap-4 mb-2">
          <label htmlFor="data">Selecionar data:</label>
          <input
            id="data"
            type="date"
            value={format(dataSelecionada, 'yyyy-MM-dd')}
            onChange={e => {
              const selected = new Date(e.target.value + 'T00:00:00');
              setDataSelecionada(selected);
            }}
            className="bg-black text-white border border-neutral-700 rounded px-2"
          />
          <button
            onClick={() => setAnimar(true)}
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={logs.length === 0}
          >Iniciar</button>
          <button
            onClick={() => setIsPaused(p => !p)}
            className="px-4 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            disabled={logs.length === 0 || !animar}
          >{isPaused ? 'Continuar' : 'Pausar'}</button>
          <button
            onClick={() => {
              setAnimar(false);
              setIsPaused(false);
              animCoords.current = [];
              animIndex.current = 0;
              if (intervalId.current) clearInterval(intervalId.current);
            }}
            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={logs.length === 0}
          >Reiniciar</button>
        </div>
        {loading && (
          <div className="p-4 bg-neutral-900 border border-neutral-700 rounded text-center mb-4">
            <span className="animate-pulse">Carregando rota otimizada...</span>
          </div>
        )}
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] rounded-lg bg-neutral-900 border border-neutral-700 text-center">
            <img
              src="/empty-map.svg"
              alt="Sem registros"
              className="w-40 mx-auto mb-6 opacity-70"
              style={{ filter: 'grayscale(1)' }}
            />
            <h3 className="text-xl font-bold mb-2">Nenhum registro encontrado</h3>
            <p className="text-neutral-400">Nenhum trajeto registrado para esta data.<br />Selecione outro dia ou comece a rodar!</p>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-[800px] rounded-lg" />
        )}
      </div>
      <div className="col-span-4">
        <Filters />
        <div className="bg-neutral-900 p-4 rounded text-sm mt-4">
          <h2 className="text-lg font-bold mb-2">Resumo do Dia</h2>
          <p><strong>Pontos:</strong> {logs.length}</p>
          <p><strong>Distância:</strong> {distancia.toFixed(2)} km</p>
          <p><strong>Velocidade média:</strong> {mediaVelocidade.toFixed(1)} km/h</p>
          <p><strong>Tempo rodando:</strong> {tempoTotal.toFixed(2)} h</p>
          <p><strong>Tempo parado:</strong> {tempoParado.toFixed(2)} h</p>
        </div>
      </div>
    </div>
  );
}

function getMarkerColor(value: number) {
  const r = Math.floor(255 * value);
  const g = Math.floor(255 * (1 - value));
  return `rgb(${r},${g},100)`;
}
