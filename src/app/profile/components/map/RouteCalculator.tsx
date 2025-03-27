"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Stepper from "@/app/profile/components/map/stepper";
import mapboxgl from "mapbox-gl";
import ContactForm from "@/app/profile/components/map/ContactForm";
import RouteForm, { RouteData } from "@/app/profile/components/map/RouteForm";
import { getCoordinates, getRoute, reverseGeocode } from "@/app/services/mapboxService";
import RouteList, { RouteResult } from "@/app/profile/components/map/RouteList";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { addRiderRequest, RiderRequest } from "@/lib/db/firebaseServices";

// Definindo as cores para as rotas
const routeColors = ["#007AFF", "#FF5733", "#28A745", "#FFD700", "#8A2BE2"];

interface Contact {
  name: string;
  phone: string;
  email: string;
}

// Interface para os detalhes do pedido
interface RequestDetails {
  rideType: "Entrega" | "Passageiro" | "Compra";
  weightCategory: "Até 5 kg" | "5 a 15 kg" | "15 a 30 kg";
}

const RouteCalculatorWithStepper: React.FC = () => {
  // Etapas: 1 = Contato, 2 = Detalhes do Pedido e Definir Rota, 3 = Resumo
  const [currentStep, setCurrentStep] = useState<number>(1);
  const steps = ["Contato", "Detalhes do Pedido", "Resumo"];

  const [contact, setContact] = useState<Contact>({ name: "", phone: "", email: "" });
  const [requestDetails, setRequestDetails] = useState<RequestDetails>({
    rideType: "Entrega",
    weightCategory: "Até 5 kg",
  });
  const [routeData, setRouteData] = useState<RouteData>({ origin: "", destination: "" });
  const [routeResults, setRouteResults] = useState<RouteResult[]>([]);
  const [currentRouteInfo, setCurrentRouteInfo] = useState<{
    km: string;
    cost: string;
    duration: number;
  } | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Refs para os markers de origem e destino
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Inicializa o mapa com estilo dark
  const initializeMap = (container: HTMLDivElement, center: [number, number]) => {
    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/dark-v10",
      center,
      zoom: 12,
    });
    setMapInstance(map);
  };

  // Obtém a localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(loc);
          if (!mapInstance) {
            const container = document.getElementById("map-container");
            if (container) {
              initializeMap(container as HTMLDivElement, loc);
            }
          }
        },
        (err) => console.error(err)
      );
    }
  }, [mapInstance]);

  // Listener para cliques no mapa: cria/atualiza markers e faz reverse geocoding
  useEffect(() => {
    if (mapInstance) {
      const handleMapClick = async (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        if (!originMarkerRef.current) {
          originMarkerRef.current = new mapboxgl.Marker({ draggable: true, color: "green" })
            .setLngLat(coords)
            .addTo(mapInstance);
          try {
            const address = await reverseGeocode(coords);
            setRouteData((prev) => ({ ...prev, origin: address }));
          } catch (error) {
            console.error(error);
          }
          originMarkerRef.current.on("dragend", async () => {
            const newCoords = originMarkerRef.current?.getLngLat();
            if (newCoords) {
              try {
                const address = await reverseGeocode([newCoords.lng, newCoords.lat]);
                setRouteData((prev) => ({ ...prev, origin: address }));
              } catch (error) {
                console.error(error);
              }
            }
          });
        } else if (!destinationMarkerRef.current) {
          destinationMarkerRef.current = new mapboxgl.Marker({ draggable: true, color: "red" })
            .setLngLat(coords)
            .addTo(mapInstance);
          try {
            const address = await reverseGeocode(coords);
            setRouteData((prev) => ({ ...prev, destination: address }));
          } catch (error) {
            console.error(error);
          }
          destinationMarkerRef.current.on("dragend", async () => {
            const newCoords = destinationMarkerRef.current?.getLngLat();
            if (newCoords) {
              try {
                const address = await reverseGeocode([newCoords.lng, newCoords.lat]);
                setRouteData((prev) => ({ ...prev, destination: address }));
              } catch (error) {
                console.error(error);
              }
            }
          });
        } else {
          destinationMarkerRef.current.setLngLat(coords);
          try {
            const address = await reverseGeocode(coords);
            setRouteData((prev) => ({ ...prev, destination: address }));
          } catch (error) {
            console.error(error);
          }
        }
      };

      mapInstance.on("click", handleMapClick);
      return () => {
        mapInstance.off("click", handleMapClick);
      };
    }
  }, [mapInstance]);

  // Função para calcular a rota (na etapa "Definir Rota")
  const calculateRoute = async () => {
    if (!routeData.origin || !routeData.destination) {
      alert("Informe ambos os endereços (origem e destino).");
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
        color,
      };

      setRouteResults((prev) => [...prev, newRoute]);

      if (mapInstance) {
        drawRoute(newRoute, originCoords, destCoords);
      }
      // Nesta etapa, não limpamos o campo destination para manter os dados visíveis no resumo
    } catch (err) {
      console.error(err);
      alert("Erro ao calcular a rota. Verifique os endereços.");
    }
  };

  const drawRoute = (route: RouteResult, originCoords: [number, number], destCoords: [number, number]) => {
    if (!mapInstance) return;
    if (!mapInstance.getSource(route.id)) {
      mapInstance.addSource(route.id, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        },
      });
      mapInstance.addLayer({
        id: route.id,
        type: "line",
        source: route.id,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": route.color,
          "line-width": 4,
          "line-dasharray": [2, 4],
        },
      });
    }
    mapInstance.fitBounds([originCoords, destCoords], { padding: 60 });
  };

  const resetRoute = () => {
    setRouteData({ origin: "", destination: "" });
    setRouteResults([]);
    originMarkerRef.current?.remove();
    destinationMarkerRef.current?.remove();
    originMarkerRef.current = null;
    destinationMarkerRef.current = null;
  };

  const sendViaWhatsApp = () => {
    let message = `Dados do Cliente:%0ANome: ${contact.name}%0ATelefone: ${contact.phone}%0AEmail: ${contact.email}%0A%0ARotas:%0A`;
    routeResults.forEach((r, index) => {
      message += `Entrega ${index + 1}:%0AOrigem: ${r.origin}%0ADestino: ${r.destination}%0ADistância: ${r.km} km | Valor: R$ ${r.cost}%0ADuração: ${r.duration} min%0A%0A`;
    });
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handlePrint = () => window.print();

  // Função para salvar o pedido no Firebase
  const savePedido = async () => {
  // Monte o objeto do pedido
  const pedido: RiderRequest = {
    client: {
      id: contact.email, // Substitua por um identificador único se necessário
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
    },
    origin: {
      address: routeData.origin,
      coordinates: userLocation || [0, 0],
    },
    destination: {
      address: routeData.destination,
      coordinates: userLocation || [0, 0],
    },
    route: {
      distance: currentRouteInfo ? Number(currentRouteInfo.km) : 0,
      cost: currentRouteInfo ? Number(currentRouteInfo.cost) : 0,
      duration: currentRouteInfo ? currentRouteInfo.duration : 0,
      // Converter o objeto GeoJSON para string para evitar nested arrays
      geometry: routeResults.length > 0 ? JSON.stringify(routeResults[routeResults.length - 1].geojson) : "",
    },
    rideType: requestDetails.rideType,
    weightCategory: requestDetails.weightCategory,
    status: "pendente",
  };

  try {
    // Substitua "currentUserId" pelo ID real do usuário (por exemplo, auth.currentUser.uid)
    const id = await addRiderRequest("currentUserId", pedido);
    console.log("Pedido salvo com sucesso, ID:", id);
    alert("Pedido salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    alert("Erro ao salvar o pedido.");
  }
};

  // Variantes para animação com Framer Motion
  const variants = {
    initial: { opacity: 0, x: 50 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.4 } },
  };

  // Renderiza o conteúdo da sidebar conforme a etapa
  const renderSidebarContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <ContactForm contact={contact} setContact={setContact} />
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)} className="bg-blue-500 text-white px-4 py-2 rounded">
                Próximo
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Detalhes do Pedido</h2>
              <div className="mb-2">
                <label className="block mb-1">Tipo de Corrida</label>
                <select
                  value={requestDetails.rideType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setRequestDetails((prev) => ({ ...prev, rideType: e.target.value as any }))
                  }
                  className="border p-2 w-full"
                >
                  <option value="Entrega">Entrega</option>
                  <option value="Passageiro">Passageiro</option>
                  <option value="Compra">Compra</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Categoria de Peso</label>
                <select
                  value={requestDetails.weightCategory}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setRequestDetails((prev) => ({ ...prev, weightCategory: e.target.value as any }))
                  }
                  className="border p-2 w-full"
                >
                  <option value="Até 5 kg">Até 5 kg</option>
                  <option value="5 a 15 kg">5 a 15 kg</option>
                  <option value="15 a 30 kg">15 a 30 kg</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Definir Rota</h2>
              <RouteForm
                routeData={routeData}
                setRouteData={setRouteData}
                calculateRoute={calculateRoute}
                userLocation={userLocation}
              />
              <div className="mt-4">
                <RouteList
                  routeResults={routeResults}
                  removeRoute={(id) =>
                    setRouteResults(routeResults.filter((r) => r.id !== id))
                  }
                  contact={contact}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep(1)} className="bg-gray-400 text-white px-4 py-2 rounded">
                Voltar
              </Button>
              <Button
                onClick={async () => {
                  await calculateRoute();
                  setCurrentStep(3);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Calcular e Avançar
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Resumo</h2>
            <p>Total de rotas: {routeResults.length}</p>
            <p>
              Valor total: R${" "}
              {routeResults.reduce((acc, curr) => acc + Number(curr.cost), 0).toFixed(2)}
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Button onClick={sendViaWhatsApp} className="bg-green-500 text-white px-4 py-2 rounded">
                Enviar WhatsApp
              </Button>
              <Button onClick={handlePrint} className="bg-blue-500 text-white px-4 py-2 rounded">
                Imprimir
              </Button>
              <Button onClick={resetRoute} className="bg-red-500 text-white px-4 py-2 rounded">
                Nova Rota
              </Button>
              <Button onClick={savePedido} className="bg-indigo-600 text-white px-4 py-2 rounded">
                Confirmar Pedido
              </Button>
            </div>
            <div className="mt-6">
              <div className="flex flex-col items-center p-4 border rounded shadow">
                <h2 className="text-xl font-bold mb-4">Compartilhe seu Perfil</h2>
                <QRCode value={`${window.location.origin}/profile/${contact.email}`} size={250} />
                <p className="mt-4 text-sm text-gray-300">
                  {`${window.location.origin}/profile/${contact.email}`}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)} className="bg-gray-400 text-white px-4 py-2 rounded">
                Voltar
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar com Stepper e conteúdo */}
      <aside className="md:w-1/3 p-4 overflow-auto">
        <Stepper currentStep={currentStep} steps={steps} />
        <AnimatePresence exitBeforeEnter>
          <motion.div
            key={currentStep}
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
            style={{ position: "relative", width: "100%" }}
          >
            {renderSidebarContent()}
          </motion.div>
        </AnimatePresence>
      </aside>
      {/* Mapa sempre visível */}
      <main className="md:w-2/3 relative">
        <div id="map-container" className="w-full h-full" />
      </main>
    </div>
  );
};

export default RouteCalculatorWithStepper;
