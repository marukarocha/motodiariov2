'use client';

import React, { useEffect, useState } from 'react';
import Motivation from '@/components/home/Motivation';
import { Overview } from '@/components/overview';
import { useDashboardData } from '@/hooks/useDashboardData';
import { AuthProvider } from '@/components/USER/Auth/AuthContext';
import { AuthGuard } from '@/components/USER/Auth/authGuard';
import { RegisterEarningButton } from '@/app/earnings/RegisterEarningButton';
import { BikeCard } from '@/app/bike/components/BikeCard';
import { OverviewBike } from '@/app/bike/components/OverviewBike';
import WelcomeModal from '@/components/WelcomeModal';
import { Heart } from 'lucide-react';

export default function UserPage() {
  const { userData, earnings, error, loading } = useDashboardData();
  const [showOverview, setShowOverview] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    console.log('UserData:', userData);
    // Se os dados essenciais não estiverem preenchidos, consideramos o usuário novo
    if (userData && userData.firstName && userData.lastName) {
      setShowOverview(true);
      setIsWelcomeModalOpen(false);
    } else {
      setShowOverview(false);
      setIsWelcomeModalOpen(true);
    }
  }, [userData]);

  const handleCloseWelcomeModal = () => {
    setIsWelcomeModalOpen(false);
    // Opcional: recarregar os dados do usuário após o fechamento do modal
  };

  if (loading) {
    return <div>Carregando dados do usuário...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  // Calcula o displayName: se useNickname for true e existir um nickname, usa-o; caso contrário, concatena firstName e lastName.
  const displayName = userData
    ? userData.useNickname && userData.nickname && userData.nickname.trim() !== ""
      ? userData.nickname
      : `${userData.firstName} ${userData.lastName}`.trim() || 'usuário'
    : 'usuário';

  return (
    <div className="container mx-auto p-4">
      <AuthProvider>
        <AuthGuard>
          <main className="flex-1">
            <div className="container space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Coluna 1 e 2: Área de boas-vindas */}
                <div className="md:col-span-2 space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Olá, {displayName}!</h1>
                  <p className="text-muted-foreground">
                    Bem-vindo de volta! Acompanhe as últimas informações do seu dia.
                  </p>
                </div>
                {/* Coluna 3: Card de emergência */}
                <div className="flex items-center justify-center p-4 border border-red-500 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div className="text-sm">
                      {userData?.bloodType ? (
                        <p>
                          <strong>Tipo Sanguíneo:</strong> {userData.bloodType}
                        </p>
                      ) : (
                        <p>
                          <strong>Tipo Sanguíneo:</strong> Não cadastrado
                        </p>
                      )}
                      {userData?.emergencyPhone ? (
                        <p>
                          <strong>Tel. Emergência:</strong> {userData.emergencyPhone}
                        </p>
                      ) : (
                        <p>
                          <strong>Tel. Emergência:</strong> Não cadastrado
                        </p>
                      )}
                    </div>
                  </div>
                </div>
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
              <div className="rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-medium">Seus Ganhos Recentes</h3>
                <p className="text-sm">
                  Você tem um total de {earnings?.length || 0} ganhos.
                </p>
                <RegisterEarningButton onEarningAdded={() => {}} />
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
