"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Stepper from "@/app/profile/components/map/stepper";
import ContactForm from "@/app/profile/components/map/ContactForm";
import RouteForm, { RouteData } from "@/app/profile/components/map/RouteForm";
import RouteList, { RouteResult } from "@/app/profile/components/map/RouteList";
import Map from "@/app/profile/components/map/Map";

import { Button } from "@/components/ui/button";
import { addRiderRequest, RiderRequest } from "@/lib/db/firebaseServices";
import * as turf from "@turf/turf";

// Importa do seu mapboxService (com getCoordinates, getRoute, reverseGeocode)
import { getCoordinates, getRoute, reverseGeocode } from "@/app/services/mapboxService";

interface Contact {
  name: string;
  phone: string;
  email: string;
}

interface RequestDetails {
  rideType: "Entrega" | "Passageiro" | "Compra";
  weightCategory: "Até 5 kg" | "5 a 15 kg" | "15 a 30 kg";
}

interface RouteCalculatorProps {
  profileId: string;
}

const routeColors = ["#007AFF", "#FF5733", "#28A745", "#FFD700", "#8A2BE2"];

/** Soma o overlap em km (lineOverlap) */
function calcularOverlapTotal(routeResults: RouteResult[]): number {
  let totalKm = 0;
  for (let i = 0; i < routeResults.length; i++) {
    for (let j = i + 1; j < routeResults.length; j++) {
      const overlap = turf.lineOverlap(routeResults[i].geojson, routeResults[j].geojson, {
        tolerance: 0.0001,
      });
      overlap.features.forEach((feat) => {
        totalKm += turf.length(feat, { units: "kilometers" });
      });
    }
  }
  return totalKm;
}

/** Se quiser desenhar a overlap em branco no mapa */
function calcularOverlapFeatures(routeResults: RouteResult[]): GeoJSON.FeatureCollection {
  const feats: GeoJSON.Feature[] = [];
  for (let i = 0; i < routeResults.length; i++) {
    for (let j = i + 1; j < routeResults.length; j++) {
      const overlap = turf.lineOverlap(routeResults[i].geojson, routeResults[j].geojson, {
        tolerance: 0.0001,
      });
      overlap.features.forEach((f) => feats.push(f));
    }
  }
  return {
    type: "FeatureCollection",
    features: feats,
  };
}

const RouteCalculatorWithStepper: React.FC<RouteCalculatorProps> = ({ profileId }) => {
  // Passos do stepper
  const [currentStep, setCurrentStep] = useState<number>(1);
  const steps = ["Contato", "Pedido", "Rota", "Resumo"];

  // Passo 1: contato
  const [contact, setContact] = useState<Contact>({
    name: "",
    phone: "",
    email: "",
  });

  // Passo 2: detalhes do pedido
  const [requestDetails, setRequestDetails] = useState<RequestDetails>({
    rideType: "Entrega",
    weightCategory: "Até 5 kg",
  });

  // Passo 3: dados de rota
  const [routeData, setRouteData] = useState<RouteData>({ origin: "", destination: "" });
  const [routeResults, setRouteResults] = useState<RouteResult[]>([]);
  const [currentRouteInfo, setCurrentRouteInfo] = useState<{
    km: string;
    cost: string;
    duration: number;
  } | null>(null);

  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  // Markers
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Overlap km
  const [overlapKm, setOverlapKm] = useState<number>(0);

  // handleMapLoad
  const handleMapLoad = (map: mapboxgl.Map) => {
    setMapInstance(map);

    // Exemplo: centrar no GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          map.setCenter(loc);
          map.setZoom(12);
        },
        (err) => console.error("Erro geoloc:", err)
      );
    }

    map.on("click", handleMapClick);
  };

  const handleMapClick = async (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    if (!mapInstance) return;
    const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
  
    // Se temos a posição do usuário (GPS) e queremos limitar a 150 km
    if (userLocation) {
      // Cria bounding box em torno do GPS
      const bbox = computeBbox(userLocation[0], userLocation[1], 150);
      // Checa se as coords do clique estão dentro dessa box
      if (!isInsideBbox(coords, bbox)) {
        alert("Fora do raio de 150 km!");
        return; // Cancela antes de criar o marcador
      }
    }
  
    // Se passou pela checagem, criamos/atualizamos o pin
    if (!originMarkerRef.current) {
      // Cria o pin de origem (verde)
      originMarkerRef.current = new mapboxgl.Marker({ draggable: true, color: "green" })
        .setLngLat(coords)
        .addTo(mapInstance);
  
      try {
        const address = await reverseGeocode(coords);
        setRouteData((prev) => ({ ...prev, origin: address }));
      } catch (err) {
        console.error("Erro reverse geocode (origem):", err);
      }
  
      // Dragend da origem
      originMarkerRef.current.on("dragend", async () => {
        const mPos = originMarkerRef.current?.getLngLat();
        if (mPos) {
          const c: [number, number] = [mPos.lng, mPos.lat];
          try {
            const address = await reverseGeocode(c);
            setRouteData((prev) => ({ ...prev, origin: address }));
          } catch (err) {
            console.error("Erro reverse geocode (drag origem):", err);
          }
        }
      });
    } else if (!destinationMarkerRef.current) {
      // Cria destino (vermelho)
      destinationMarkerRef.current = new mapboxgl.Marker({ draggable: true, color: "red" })
        .setLngLat(coords)
        .addTo(mapInstance);
  
      try {
        const address = await reverseGeocode(coords);
        setRouteData((prev) => ({ ...prev, destination: address }));
      } catch (err) {
        console.error("Erro reverse geocode (destino):", err);
      }
  
      // Dragend do destino
      destinationMarkerRef.current.on("dragend", async () => {
        const mPos = destinationMarkerRef.current?.getLngLat();
        if (mPos) {
          const c: [number, number] = [mPos.lng, mPos.lat];
          try {
            const address = await reverseGeocode(c);
            setRouteData((prev) => ({ ...prev, destination: address }));
          } catch (err) {
            console.error("Erro reverse geocode (drag destino):", err);
          }
        }
      });
    } else {
      // Já temos ambos => atualiza apenas o destino
      destinationMarkerRef.current.setLngLat(coords);
      try {
        const address = await reverseGeocode(coords);
        setRouteData((prev) => ({ ...prev, destination: address }));
      } catch (err) {
        console.error("Erro reverse geocode (update destino):", err);
      }
    }
  };

  // Recalcula overlap
  const updateOverlap = () => {
    if (!mapInstance || routeResults.length < 2) {
      setOverlapKm(0);
      if (mapInstance?.getLayer("overlap-layer")) {
        mapInstance.removeLayer("overlap-layer");
      }
      if (mapInstance?.getSource("overlap-layer")) {
        mapInstance.removeSource("overlap-layer");
      }
      return;
    }
    const km = calcularOverlapTotal(routeResults);
    setOverlapKm(km);

    // Remove se existir
    if (mapInstance.getLayer("overlap-layer")) {
      mapInstance.removeLayer("overlap-layer");
    }
    if (mapInstance.getSource("overlap-layer")) {
      mapInstance.removeSource("overlap-layer");
    }

    // Adiciona layer
    const feats = calcularOverlapFeatures(routeResults);
    mapInstance.addSource("overlap-layer", {
      type: "geojson",
      data: feats
    });
    mapInstance.addLayer({
      id: "overlap-layer",
      type: "line",
      source: "overlap-layer",
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#ffffff",
        "line-width": 4,
        "line-dasharray": [2, 2]
      }
    });
  };

  // Calcular rota
  const calculateRoute = async () => {
    if (!routeData.origin || !routeData.destination) {
      alert("Informe origem e destino.");
      return;
    }
    try {
      const originCoords = await getCoordinates(routeData.origin);
      const destCoords = await getCoordinates(routeData.destination);
      const route = await getRoute(originCoords, destCoords);

      const km = (route.distance / 1000).toFixed(2);
      const cost = (Number(km) * 2.5).toFixed(2);
      const duration = Math.ceil(route.duration / 60);

      setCurrentRouteInfo({ km, cost, duration });
      const color = routeColors[routeResults.length % routeColors.length];

      const newRoute: RouteResult = {
        id: Date.now().toString(),
        origin: routeData.origin,
        destination: routeData.destination,
        km,
        cost,
        duration,
        geojson: route.geometry,
        color
      };

      setRouteResults((old) => [...old, newRoute]);

      if (mapInstance) {
        drawRoute(newRoute, originCoords, destCoords);
      }

      // Recalcular overlap
      setTimeout(() => updateOverlap(), 0);

    } catch (err) {
      console.error("Erro ao calcular rota:", err);
      alert("Falha ao obter rota. Verifique seu endereço.");
    }
  };

  // Desenhar rota
  const drawRoute = (
    route: RouteResult,
    originCoords: [number, number],
    destCoords: [number, number]
  ) => {
    if (!mapInstance) return;

    if (!mapInstance.isStyleLoaded()) {
      mapInstance.once("load", () => addRouteLayer(route, originCoords, destCoords));
    } else {
      addRouteLayer(route, originCoords, destCoords);
    }
  };

  const addRouteLayer = (
    route: RouteResult,
    originCoords: [number, number],
    destCoords: [number, number]
  ) => {
    if (!mapInstance) return;

    if (!mapInstance.getSource(route.id)) {
      mapInstance.addSource(route.id, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: route.geojson
        },
      });
      mapInstance.addLayer({
        id: route.id,
        type: "line",
        source: route.id,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": route.color,
          "line-width": 4
        }
      });
    }

    mapInstance.fitBounds([originCoords, destCoords], { padding: 60 });
  };

  // Remover rotas
  const resetRoute = () => {
    setRouteData({ origin: "", destination: "" });
    setRouteResults([]);
    originMarkerRef.current?.remove();
    destinationMarkerRef.current?.remove();
    originMarkerRef.current = null;
    destinationMarkerRef.current = null;
    setCurrentRouteInfo(null);
    setOverlapKm(0);

    if (mapInstance) {
      routeResults.forEach((r) => {
        if (mapInstance.getLayer(r.id)) {
          mapInstance.removeLayer(r.id);
        }
        if (mapInstance.getSource(r.id)) {
          mapInstance.removeSource(r.id);
        }
      });
      // overlap
      if (mapInstance.getLayer("overlap-layer")) {
        mapInstance.removeLayer("overlap-layer");
      }
      if (mapInstance.getSource("overlap-layer")) {
        mapInstance.removeSource("overlap-layer");
      }
    }
  };

  // Remover rota individual
  const handleRemoveRoute = (id: string) => {
    const newArr = routeResults.filter((r) => r.id !== id);
    setRouteResults(newArr);

    if (mapInstance) {
      if (mapInstance.getLayer(id)) {
        mapInstance.removeLayer(id);
      }
      if (mapInstance.getSource(id)) {
        mapInstance.removeSource(id);
      }
    }
    setTimeout(() => updateOverlap(), 0);
  };

  // Enviar no WhatsApp
  const sendViaWhatsApp = () => {
    let message = `Cliente: ${contact.name}%0A${contact.phone}%0A${contact.email}%0A%0ARotas:%0A`;
    routeResults.forEach((r, i) => {
      message += `Rota ${i + 1}: ${r.origin} -> ${r.destination}%0A${r.km} km | R$ ${r.cost}%0A%0A`;
    });
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  // Salvar no Firebase
  const savePedido = async () => {
    if (!currentRouteInfo) {
      alert("Calcule ao menos uma rota.");
      return;
    }
    const pedido: RiderRequest = {
      client: {
        id: contact.email || "no-email",
        name: contact.name || "Sem nome",
        phone: contact.phone || "Sem telefone",
        email: contact.email || "Sem email"
      },
      origin: {
        address: routeData.origin,
        coordinates: [0, 0]
      },
      destination: {
        address: routeData.destination,
        coordinates: [0, 0]
      },
      route: routeResults.map((r) => ({
        id: r.id,
        origin: r.origin,
        destination: r.destination,
        km: Number(r.km),
        cost: Number(r.cost),
        duration: r.duration,
        geometry: JSON.stringify(r.geojson),
        color: r.color
      })),
      rideType: requestDetails.rideType,
      weightCategory: requestDetails.weightCategory,
      status: "pendente"
    };

    try {
      const id = await addRiderRequest(profileId, pedido);
      alert("Pedido salvo! ID: " + id);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Falha ao salvar pedido.");
    }
  };

  // Animações
  const variants = {
    initial: { opacity: 0, x: 50 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.4 } },
  };

  const stepsContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <ContactForm contact={contact} setContact={setContact} />
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)}>Próximo</Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Detalhes do Pedido</h2>
            <div>
              <label>Tipo de Corrida</label>
              <select
                value={requestDetails.rideType}
                onChange={(e) =>
                  setRequestDetails({
                    ...requestDetails,
                    rideType: e.target.value as any,
                  })
                }
                className="border p-2 w-full"
              >
                <option value="Entrega">Entrega</option>
                <option value="Passageiro">Passageiro</option>
                <option value="Compra">Compra</option>
              </select>
            </div>
            <div>
              <label>Categoria de Peso</label>
              <select
                value={requestDetails.weightCategory}
                onChange={(e) =>
                  setRequestDetails({
                    ...requestDetails,
                    weightCategory: e.target.value as any,
                  })
                }
                className="border p-2 w-full"
              >
                <option value="Até 5 kg">Até 5 kg</option>
                <option value="5 a 15 kg">5 a 15 kg</option>
                <option value="15 a 30 kg">15 a 30 kg</option>
              </select>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(3)}>Próximo</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Definir Rota</h2>
            <RouteForm
              routeData={routeData}
              setRouteData={setRouteData}
              calculateRoute={calculateRoute}
              userLocation={null} 
            />
            <div className="mt-4">
              <RouteList
                routeResults={routeResults}
                removeRoute={handleRemoveRoute}
                contact={contact}
              />
            </div>
            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep(2)}>Voltar</Button>
              <Button onClick={() => setCurrentStep(4)}>Próximo</Button>
            </div>
          </div>
        );
      case 4: {
        const totalSemDesc = routeResults.reduce((acc, r) => acc + Number(r.cost), 0);
        const discount = overlapKm; // Exemplo: 1 real de desconto por km sobreposto
        const totalFinal = totalSemDesc - discount;

        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Resumo</h2>
            <p>Rotas: {routeResults.length}</p>
            {routeResults.length > 1 && (
              <>
                <p>Trecho compartilhado: {overlapKm.toFixed(2)} km</p>
                <p>Desconto: R$ {discount.toFixed(2)}</p>
              </>
            )}
            <p>Valor sem desconto: R$ {totalSemDesc.toFixed(2)}</p>
            <p>Valor final: R$ {totalFinal.toFixed(2)}</p>

            <div className="flex gap-2">
              <Button onClick={sendViaWhatsApp} className="bg-green-500">
                WhatsApp
              </Button>
              <Button onClick={savePedido} className="bg-green-600">
                Confirmar
              </Button>
            </div>
            <div>
              <Button onClick={() => setCurrentStep(3)}>Voltar</Button>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row h-[600px] overflow-hidden border">
      {/* Lateral com steps */}
      <aside className="md:w-1/3 p-4 overflow-auto border-r">
        <Stepper currentStep={currentStep} steps={steps} />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            {stepsContent()}
          </motion.div>
        </AnimatePresence>
      </aside>

      {/* Mapa */}
      <main className="md:w-2/3 relative">
        <Map onMapLoad={handleMapLoad} />

        {/* Se houver overlap, mostra no canto */}
        {overlapKm > 0 && (
          <div className="absolute top-2 left-2 bg-gray-900 p-2 rounded shadow z-10">
            <p className="text-sm font-semibold">
              Km compartilhados: {overlapKm.toFixed(2)}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RouteCalculatorWithStepper;
