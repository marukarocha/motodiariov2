"use client";

import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions';
import { CiCircleRemove } from "react-icons/ci";

mapboxgl.accessToken = 'pk.eyJ1IjoibWFydWsiLCJhIjoiY204bndmdnIwMDBiYTJxb2oydW00emplcSJ9.FO5u9DFzfdDYLY2aVBm4Cg';

const geocodingClient = mbxGeocoding({ accessToken: mapboxgl.accessToken });
const directionsClient = mbxDirections({ accessToken: mapboxgl.accessToken });

export default function RouteCalculator() {
  // Estado do formulário de contato
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  // Estado dos dados da rota (origem e destino)
  const [routeData, setRouteData] = useState({ origin: '', destination: '' });
  // Lista de rotas calculadas
  const [routeResults, setRouteResults] = useState([]);
  // Overlay com informações da última rota calculada
  const [currentRouteInfo, setCurrentRouteInfo] = useState(null);

  // Referências para o mapa e marcadores
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  // Centro do mapa (inicia com fallback)
  const [mapCenter, setMapCenter] = useState([-48.5495, -27.5945]);

  // Inicializa o mapa após montar o componente
  useEffect(() => {
    const initMap = (center) => {
      // Se o center for inválido, usa fallback
      if (!center || center.some((n) => isNaN(n))) {
        center = [-48.5495, -27.5945];
      }
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/maruk/cm8plr48j009f01s3hnhn787q',
        center: center,
        zoom: 12,
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const center = [position.coords.longitude, position.coords.latitude];
          setMapCenter(center);
          initMap(center);
        },
        (err) => {
          console.error(err);
          initMap(mapCenter);
        }
      );
    } else {
      initMap(mapCenter);
    }
  }, []);

  // Função para obter coordenadas via geocoding (forward)
  const getCoordinates = async (address) => {
    const response = await geocodingClient
      .forwardGeocode({ query: address, limit: 1 })
      .send();
    if (response.body.features.length > 0) {
      return response.body.features[0].geometry.coordinates;
    }
    throw new Error("Coordenadas não encontradas para: " + address);
  };

  // Calcula a rota com base nos endereços ou marcadores
  const calculateRoute = async () => {
    if (!routeData.origin || !routeData.destination) {
      alert("Informe ambos os endereços (origem e destino).");
      return;
    }
    try {
      // Obtém as coordenadas a partir dos endereços
      const originCoords = await getCoordinates(routeData.origin);
      const destCoords = await getCoordinates(routeData.destination);

      // Atualiza ou cria os marcadores no mapa (arrastáveis)
      if (originMarkerRef.current) {
        originMarkerRef.current.setLngLat(originCoords);
      } else {
        originMarkerRef.current = new mapboxgl.Marker({ color: 'green', draggable: true })
          .setLngLat(originCoords)
          .addTo(mapRef.current);
        originMarkerRef.current.on('dragend', () => handleMarkerDrag('origin'));
      }
      if (destMarkerRef.current) {
        destMarkerRef.current.setLngLat(destCoords);
      } else {
        destMarkerRef.current = new mapboxgl.Marker({ color: 'red', draggable: true })
          .setLngLat(destCoords)
          .addTo(mapRef.current);
        destMarkerRef.current.on('dragend', () => handleMarkerDrag('destination'));
      }

      // Chama a API de direções
      const response = await directionsClient
        .getDirections({
          profile: 'driving',
          waypoints: [
            { coordinates: originCoords },
            { coordinates: destCoords },
          ],
          geometries: 'geojson',
        })
        .send();

      if (!response.body.routes || response.body.routes.length === 0) {
        alert("Rota não encontrada.");
        return;
      }

      const route = response.body.routes[0];
      const km = (route.distance / 1000).toFixed(2);
      const cost = (km * 2.5).toFixed(2);
      const duration = Math.ceil(route.duration / 60);

      // Atualiza overlay com informações da rota
      setCurrentRouteInfo({ km, cost, duration });

      // Cria um objeto de rota e adiciona à lista
      const newRoute = {
        id: Date.now().toString(),
        origin: routeData.origin,
        destination: routeData.destination,
        km,
        cost,
        duration,
        geojson: route.geometry,
      };

      setRouteResults((prev) => [...prev, newRoute]);

      // Desenha a rota no mapa
      drawRoute(newRoute);

      // Ajusta o zoom para englobar os pontos
      mapRef.current.fitBounds([originCoords, destCoords], { padding: 60 });
    } catch (err) {
      console.error(err);
      alert("Erro ao calcular a rota. Verifique os endereços.");
    }
  };

  // Desenha uma rota no mapa usando camada GeoJSON
  const drawRoute = (route) => {
    if (!mapRef.current.getSource(route.id)) {
      mapRef.current.addSource(route.id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geojson,
        },
      });
      mapRef.current.addLayer({
        id: route.id,
        type: 'line',
        source: route.id,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#007AFF', 'line-width': 4, 'line-dasharray': [2, 4] },
      });
    }
  };

  // Atualiza o endereço ao arrastar o marcador e recalcula a rota
  const handleMarkerDrag = async (type) => {
    try {
      const marker = type === 'origin' ? originMarkerRef.current : destMarkerRef.current;
      const coords = marker.getLngLat().toArray();
      const response = await geocodingClient
        .reverseGeocode({ query: coords, limit: 1 })
        .send();
      if (response.body.features.length > 0) {
        const placeName = response.body.features[0].place_name;
        setRouteData((prev) => ({ ...prev, [type]: placeName }));
        // Recalcula a rota se ambos os marcadores existirem
        if (originMarkerRef.current && destMarkerRef.current) {
          calculateRoute();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Gera mensagem formatada para envio via WhatsApp
  const sendViaWhatsApp = () => {
    let message = `Dados do Cliente:%0ANome: ${contact.name}%0ATelefone: ${contact.phone}%0AEmail: ${contact.email}%0A%0ARotas:%0A`;
    routeResults.forEach((r, index) => {
      message += `Entrega ${index + 1}:%0AOrigem: ${r.origin}%0ADestino: ${r.destination}%0ADistância: ${r.km} km | Valor: R$ ${r.cost}%0ADuração: ${r.duration} min%0A%0A`;
    });
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Remove uma rota da lista e do mapa
  const removeRoute = (id) => {
    if (mapRef.current.getLayer(id)) {
      mapRef.current.removeLayer(id);
      mapRef.current.removeSource(id);
    }
    setRouteResults((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar com formulário de contato e de rota */}
      <div className="md:w-1/3 p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Contato</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Nome"
            value={contact.name}
            onChange={(e) => setContact({ ...contact, name: e.target.value })}
            className="border p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Telefone"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            className="border p-2 w-full mb-2"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        <h2 className="text-xl font-bold mb-4">Rota</h2>
        <div className="mb-3">
          <input
            className="border p-2 w-full mb-1"
            placeholder="Origem"
            value={routeData.origin}
            onChange={(e) => setRouteData({ ...routeData, origin: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <input
            className="border p-2 w-full mb-1"
            placeholder="Destino"
            value={routeData.destination}
            onChange={(e) => setRouteData({ ...routeData, destination: e.target.value })}
          />
        </div>
        <button onClick={calculateRoute} className="w-full bg-blue-500 text-white p-2 rounded mb-4">
          Calcular Rota
        </button>
        <h3 className="font-bold mb-2">Rotas Criadas:</h3>
        <ul className="text-xs">
          {routeResults.map((r, index) => (
            <li key={r.id} className="border-b pb-1 mb-1 flex justify-between items-center">
              <div>
                <div><strong>{index + 1}.</strong> <span className="text-green-600">{r.origin}</span> → <span className="text-red-600">{r.destination}</span></div>
                <div>{r.km} km | R$ {r.cost} | {r.duration} min</div>
              </div>
              <button onClick={() => removeRoute(r.id)} className="text-red-500 text-2xl">
                <CiCircleRemove />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2">
          <button onClick={sendViaWhatsApp} className="w-full bg-green-500 text-white p-2 rounded">
            Enviar WhatsApp
          </button>
        </div>
      </div>
      {/* Mapa com overlay de informações */}
      <div className="md:w-2/3 relative">
        <div className="w-full h-full" ref={mapContainer} />
        {currentRouteInfo && (
          <div className="absolute top-0 left-0 m-4 bg-blue-500 text-white p-3 rounded shadow-md">
            <div><strong>Tempo (moto):</strong> {currentRouteInfo.duration} min</div>
            <div><strong>Distância:</strong> {currentRouteInfo.km} km</div>
            <div><strong>Valor:</strong> R$ {currentRouteInfo.cost}</div>
          </div>
        )}
      </div>
      {/* Área fixa para simulação de etiquetas com QR Code */}
      <div className="fixed bottom-0 left-0 w-full md:w-auto flex flex-row flex-wrap p-4 shadow-md bg-white max-h-64 overflow-auto">
        {routeResults.map((r) => (
          <div key={r.id} className="border m-2 p-2 text-xs">
            <div><strong>Cliente:</strong> {contact.name || 'N/D'}</div>
            <div><strong>Destino:</strong> {r.destination}</div>
            <div><strong>Valor:</strong> R$ {r.cost}</div>
            <div className="mt-2">
              <QRCode
                value={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.destination)}`}
                size={64}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
