
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { getBikeData } from '@/lib/db/firebaseServices';
import { faMotorcycle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface BikeData {
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  initialMileage: number;
  oilChangeInterval: number;
  relationChangeKm: number;
  oilChangeKm: number;
  lubricationKm: number;
  lastMaintenance: string;
  tankVolume: number;
  averageConsumption: number | null;
}

export default function ViewBikePage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [bikeData, setBikeData] = useState<BikeData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBikeData = async () => {
      try {
        const data = await getBikeData(currentUser?.uid || '');
        setBikeData(data);
      } catch (error) {
        console.error("Erro ao buscar dados da moto:", error);
        toast({ title: 'Erro!', description: 'Erro ao buscar dados da moto.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchBikeData();
  }, [currentUser, toast]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dados da sua Moto</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : bikeData ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <FontAwesomeIcon icon={faMotorcycle} className="mr-2" />
              {bikeData.make} {bikeData.model} ({bikeData.year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Placa: {bikeData.plate}</p>
            <p>Cor: {bikeData.color}</p>
            <p>Quilometragem Inicial: {bikeData.initialMileage}</p>
            {/* ... display other bike data ... */}
          </CardContent>
        </Card>
      ) : (
        <p>Nenhuma moto registrada.</p>
      )}
      <Button onClick={() => router.push('/bike/register')} className="mt-4">Editar Dados</Button>
    </div>
  );
}
