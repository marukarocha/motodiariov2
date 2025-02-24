// src/components/GasStationsList.tsx
import React from "react";
import { GasStation } from "@/hooks/useGasStations";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react"; // ícone para mapas

interface GasStationsListProps {
  stations: GasStation[];
}

export function GasStationsList({ stations }: GasStationsListProps) {
  return (
    <div className="space-y-4">
      {stations.map((station) => (
        <div key={station.id} className="flex items-center justify-between border p-4 rounded-md">
          <div>
            <h3 className="font-semibold">{station.name}</h3>
            {station.address && <p className="text-sm text-muted-foreground">{station.address}</p>}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              // Cria a URL do Google Maps com as coordenadas
              const url = `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`;
              window.open(url, "_blank");
            }}
          >
            <MapPin className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
