'use client';

import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { FaMotorcycle } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { BikeData } from '@/app/bike/register'; // Importa a interface atualizada de BikeData

interface BikeCardProps {
  bikeData: BikeData | null;
  isLoading: boolean;
}

const BadgeLevel = ({ level }: { level: string }) => (
  <Badge className={`ml-2 ${level === 'Iniciante' ? 'bg-blue-500' : level === 'Intermediário' ? 'bg-green-500' : 'bg-yellow-500'}`}>
    {level}
  </Badge>
);

export const BikeCard: React.FC<BikeCardProps> = ({ bikeData, isLoading }) => {
  
  if (isLoading) {
    return <p>Carregando dados da moto...</p>;
  }

  if (!bikeData) {
    return <p>Nenhuma moto registrada.</p>;
  }

  return (
    <Card className="mb-4 p-4">
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center md:text-left">
            <FaMotorcycle size={64} className="text-primary mx-auto md:mx-0" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {bikeData.make} {bikeData.model}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Informações gerais da sua moto.
            </CardDescription>
            <div className="mt-2 flex items-center">
              <p className="font-semibold">Nível da Moto:</p>
              <BadgeLevel level="Intermediário" />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Placa:</strong> {bikeData.plate}</p>
            <p><strong>Cor:</strong> {bikeData.color}</p>
            <p><strong>Ano:</strong> {bikeData.year}</p>
          </div>
          <div>
            <p><strong>KM Inicial:</strong> {bikeData.initialMileage} km</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BikeCard;
