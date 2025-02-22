'use client';

import { useEffect, useState } from 'react';
import { Header } from "@/components/header"
import  Motivation  from "@/components/home/Motivation"
import { Overview } from "@/components/overview"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useDashboardData } from '@/hooks/useDashboardData';
import { AuthProvider } from '@/components/USER/Auth/AuthContext';
import { AuthGuard } from '@/components/USER/Auth/authGuard';
import { RegisterEarningButton } from '@/app/earnings/RegisterEarningButton';
import { BikeCard } from '@/app/bike/components/BikeCard';
import { OverviewBike } from '@/app/bike/components/OverviewBike'; // Import OverviewBike Component
import { useRouter } from 'next/navigation';

interface Earning {
    id: string;
    amount: number;
    mileage: number;
    platform: string;
    tip?: number;
    description?: string;
    date: any;
    hours?: number;
}

const handleAddEarning = () => {
  fetchData();
};
export default function UserPage() {
  const { userData, earnings, error, loading } = useDashboardData();
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    if (userData) {
      setShowOverview(true);
    } else {
      setShowOverview(false);
    }
  }, [userData]);

  if (loading) {
    return <div>Carregando dados do usuário...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  if (!userData) {
    return <div>Nenhum dado de usuário encontrado.</div>;
  }

  return (
<div className="container mx-auto p-4">
         <AuthProvider>
       <AuthGuard>
      <Header />
      <main className="flex-1">
        <div className="container space-y-4 py-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Olá! </h1>
            <p className="text-muted-foreground">Bem vindo de volta, {userData.name}! acompanhe os ultimas informações do seu dia.</p>
          </div>
          {showOverview && <Overview earnings={earnings} />}
          <div > {/* Layout responsivo */}
         
         
             <BikeCard bikeData={null} isLoading={true} /> {/*  isLoading is hardcoded to true - PROBLEM! */}
          
          
             </div>

           {/* Bike Section with Background Image and Blur */}



          <div className="mt-8 rounded-lg shadow-sm bg-cover bg-center relative overflow-hidden" style={{backgroundImage: `url('/bike/maitanance.png')`}}>
            <div className="absolute inset-0 backdrop-blur-sm bg-[#1c1b22]/50   z-10 "></div> {/* Overlay for blur effect */}
            <div className="relative p-6 z-20"> {/* Content container */}
              <h2 className="text-2xl font-bold text-white mb-4">Visão Geral da Moto</h2>
              <OverviewBike />
            </div>
          </div>



          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium">Seus Ganhos Recentes</h3>
              <p className="text-sm text-muted-foreground">Voce tem o tatal de {earnings?.length || 0} ganhos.</p>
                   <RegisterEarningButton onEarningAdded={handleAddEarning} />
                    
            </div>
          </div>
          <Motivation className="mt-8" /> {/* Adiciona uma margem superior */}
        </div>
      </main>
      </AuthGuard>
    </AuthProvider>
    </div>
  );
}
