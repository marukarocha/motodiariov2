// src/app/profile/components/map/RouteList.tsx
"use client";
import React, { FC } from 'react';
import { CiCircleRemove } from 'react-icons/ci';
import QRCodeLabel from '@/app/profile/components/map/QRCodeLabel';
import { Contact } from '@/app/profile/components/map/ContactForm';

export interface RouteResult {
  id: string;
  origin: string;
  destination: string;
  km: string;
  cost: string;
  duration: number;
  geojson: any;
  color: string;
}

interface RouteListProps {
  routeResults: RouteResult[];
  removeRoute: (id: string) => void;
  contact: Contact;
}

const RouteList: FC<RouteListProps> = ({ routeResults, removeRoute, contact }) => {
  return (
    <div>
      <h3 className="font-bold mb-2">Rotas Criadas:</h3>
      <ul className="text-xs">
        {routeResults.map((r, index) => (
          <li
            key={r.id}
            className="border-b pb-1 mb-1 grid grid-cols-12 items-center gap-2"
          >
            {/* Coluna 1: Número da rota */}
            <div
              className="col-span-2 m-5 flex items-center justify-center rounded-full h-10 w-10 text-white font-bold"
              style={{ backgroundColor: r.color }}
            >
              {index + 1}
            </div>
            {/* Coluna 2: Dados da rota */}
            <div className="col-span-6">
              <div className="text-sm">
                <strong className='text-green-400'>{r.origin}</strong> →{' '}
                <span className="text-red-200">{r.destination}</span>
              </div>
              <div className="text-xs">
                {r.km} km | R$ {r.cost} | {r.duration} min
              </div>
            </div>
            {/* Coluna 3: QR Code */}
            <div className="col-span-3">
              <QRCodeLabel 
                value={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.destination)}`}
                size={120}
              />
            </div>
            {/* Coluna 4: Botão remover */}
            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => removeRoute(r.id)}
                className="text-red-500 text-2xl"
              >
                <CiCircleRemove />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RouteList;
