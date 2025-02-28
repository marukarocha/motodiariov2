// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import Motivation from '@/components/home/Motivation';
import { Overview } from '@/components/overview';
import { useDashboardData } from '@/hooks/useDashboardData';
import { AuthProvider } from '@/components/USER/Auth/AuthContext';
import { AuthGuard } from '@/components/USER/Auth/authGuard';
import { RegisterEarningButton } from '@/app/earnings/RegisterEarningButton';
import { BikeCard } from '@/app/bike/components/BikeCard';
import { OverviewBike } from '@/app/bike/components/OverviewBike';
import WelcomeModal from '@/components/Welcome';

export default function UserPage() {
  const { userData, earnings, error, loading } = useDashboardData();
  const [showOverview, setShowOverview] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      setShowOverview(true);
    } else {
      setShowOverview(false);
      setIsWelcomeModalOpen(true);
    }
  }, [userData]);

  const handleCloseWelcomeModal = () => {
    setIsWelcomeModalOpen(false);
    // Opcional: Recarregar os dados do usuário após o fechamento do modal
  };

  if (loading) {
    return <div>Carregando dados do usuário...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <AuthProvider>
        <AuthGuard>
          <Header />
          <main className="flex-1">
            <div className="container space-y-4 py-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Olá!</h1>
                <p className="text-muted-foreground">
                  Bem-vindo de volta, {userData?.name || 'usuário'}! Acompanhe as últimas informações do seu dia.
                </p>
              </div>
              {showOverview && <Overview earnings={earnings} />}
              <div>
                <BikeCard bikeData={null} isLoading={true} />
              </div>
              <div
                className="mt-8 rounded-lg shadow-sm bg-cover bg-center relative overflow-hidden"
                style={{ backgroundImage: `url('/bike/maitanance.png')` }}
              >
                <div className="absolute inset-0 backdrop-blur-sm bg-[#1c1b22]/50 z-10"></div>
                <div className="relative p-6 z-20">
                  <h2 className="text-2xl font-bold text-white mb-4">Visão Geral da Moto</h2>
                  <OverviewBike />
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium">Seus Ganhos Recentes</h3>
                  <p className="text-sm text-muted-foreground">
                    Você tem um total de {earnings?.length || 0} ganhos.
                  </p>
                  <RegisterEarningButton onEarningAdded={() => {}} />
                </div>
              </div>
              <Motivation className="mt-8" />
            </div>
          </main>
        </AuthGuard>
      </AuthProvider>
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={handleCloseWelcomeModal} />
    </div>
  );
}
