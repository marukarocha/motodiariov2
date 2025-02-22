'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { getBikeData } from '@/lib/db/firebaseServices';
import { faOilCan, faTools, faCog, faGasPump } from '@fortawesome/free-solid-svg-icons'; // Corrected icon import: faCog instead of FaChain
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BikeData {
  oilChangeKm: number;
  lubricationKm: number;
  relationChangeKm: number;
  tankVolume: number;
  lastMaintenance: string;
}

export const OverviewBike = () => {
  const { currentUser } = useAuth();
  const [bikeData, setBikeData] = useState<BikeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBikeData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!currentUser?.uid) {
          setError("Usuário não autenticado");
          return;
        }
        const data = await getBikeData(currentUser.uid);
        setBikeData(data);
      } catch (error: any) {
        console.error("Erro ao carregar dados da moto:", error);
        setError(`Erro ao carregar dados: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBikeData();
  }, [currentUser]);

  if (isLoading) {
    return <p>Carregando informações da moto...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erro ao carregar informações da moto: {error}</p>;
  }

  if (!bikeData) {
    return <p>Nenhuma moto registrada. Registre sua moto para ver o overview.</p>;
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próxima Troca de Óleo</CardTitle>
          <FontAwesomeIcon icon={faOilCan} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bikeData.oilChangeKm || 'N/A'} km</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próxima Lubrificação</CardTitle>
          <FontAwesomeIcon icon={faTools} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bikeData.lubricationKm || 'N/A'} km</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próxima Troca de Relação</CardTitle>
          <FontAwesomeIcon icon={faCog} className="h-4 w-4 text-muted-foreground" /> {/* Corrected icon to faCog */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bikeData.relationChangeKm || 'N/A'} km</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capacidade do Tanque</CardTitle>
          <FontAwesomeIcon icon={faGasPump} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bikeData.tankVolume || 'N/A'} Litros</div>
        </CardContent>
      </Card>
    </div>
  );
};
