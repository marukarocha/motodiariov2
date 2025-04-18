"use client";

import React, { useEffect, useState } from "react";
import Motivation from "@/components/home/Motivation";
import { Overview } from "@/components/overview";
import { useDashboardData } from "@/hooks/useDashboardData";
import { AuthProvider } from "@/components/USER/Auth/AuthContext";
import { AuthGuard } from "@/components/USER/Auth/authGuard";
import { BikeCard } from "@/app/bike/components/BikeCard";
import { OverviewBike } from "@/app/bike/components/OverviewBike";
import WelcomeModal from "@/components/WelcomeModal";
import WelcomeBanner from "@/components/WelcomeBanner";
import { useAuth } from "@/components/USER/Auth/AuthContext"; // Importa useAuth
import CalculadoraConsumo from '../components/CalcConsumo';

export default function UserPage() {
  const { userData, earnings, error, loading } = useDashboardData();
  const { currentUser } = useAuth(); // Adicionado para obter o currentUser
  const [showOverview, setShowOverview] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    // Se os dados essenciais estiverem preenchidos, mostra o overview; caso contrário, exibe o modal de boas-vindas
    if (userData && userData.firstName && userData.lastName) {
      setShowOverview(true);
      setIsWelcomeModalOpen(false);
    } else {
      setShowOverview(false);
      setIsWelcomeModalOpen(true);
    }
  }, [userData]);

  if (loading) {
    return <div>Carregando dados do usuário...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  // Define o displayName e a URL do avatar
  const displayName = userData
    ? userData.useNickname &&
      userData.nickname &&
      userData.nickname.trim() !== ""
      ? userData.nickname
      : `${userData.firstName} ${userData.lastName}`.trim() || "usuário"
    : "usuário";

  const profileImageUrl = userData?.profileImageUrl || "/default-avatar.png";

  return (
    <div className="container mx-auto p-4">
      <AuthProvider>
        <AuthGuard>
          <main className="flex-1">
            <div className="space-y-6 py-6">
              {/* Componente de boas-vindas */}
              <WelcomeBanner
                displayName={displayName}
                profileImageUrl={profileImageUrl}
                bloodType={userData?.bloodType}
                emergencyPhone={userData?.emergencyPhone}
                profileId={currentUser?.uid || ""} // Agora currentUser está definido
              />

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
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Visão Geral da Moto
                  </h2>
                  <OverviewBike />
                  <CalculadoraConsumo />
                </div>
              </div>
              <Motivation className="mt-8" />
            </div>
          </main>
        </AuthGuard>
      </AuthProvider>
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
    </div>
  );
}
