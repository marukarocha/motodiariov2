"use client";
import { motion } from "framer-motion";
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
import { useAuth } from "@/components/USER/Auth/AuthContext";
import CalculadoraConsumo from '../components/tools/CalcConsumo';
import { Freelas } from "../components/tools/Freelas";

export default function UserPage() {
  const { userData, earnings, error, loading } = useDashboardData();
  const { currentUser, role } = useAuth();
  const [showOverview, setShowOverview] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
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

  const displayName = userData
    ? userData.useNickname && userData.nickname && userData.nickname.trim() !== ""
      ? userData.nickname
      : `${userData.firstName} ${userData.lastName}`.trim() || "usuário"
    : "usuário";

  const profileImageUrl = userData?.profileImageUrl || "/default-avatar.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      className="container mx-auto p-4"
    >
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
                profileId={currentUser?.uid || ""}
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
                </div>
              </div>
              
              {/* Ferramentas */}
              {role === "usuario" || role === "user" ? (
                <div className="mt-8 p-6 bg-yellow-100 border border-yellow-400 rounded-lg text-yellow-800">
                  <h3 className="text-lg font-bold mb-1">Ferramentas Premium</h3>
                  <p>
                    Você está usando a conta gratuita. Assine o plano de <strong>R$14,90/mês</strong> para liberar todas as funcionalidades.
                  </p>
                </div>
              ) : (
                <div
                  className="mt-8 rounded-lg shadow-sm bg-cover bg-center relative overflow-hidden"
                  style={{ backgroundImage: `url('/tools-background.jpg')` }}
                >
                  <div className="absolute inset-0 backdrop-blur-sm bg-[#1c1b22]/50 z-10"></div>
                  <div className="relative p-6 z-20">
                    <h2 className="text-2xl font-bold text-white mb-4">Ferramentas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Ferramenta 1 */}
                      <div className="bg-gray/800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-6 h-6 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <h2 className="text-lg font-semibold text-dark-800">Cálculo de Corridas</h2>
                        </div>
                        <p className="text-gray-600">Calcule os ganhos com suas corridas.</p>
                      </div>
                      {/* Ferramenta 2 */}
                      <div className="bg-gray/800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-6 h-6 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <h2 className="text-lg font-semibold text-dark-800">Cálculo de Consumo</h2>
                        </div>
                        <p className="text-gray-600">Monitore o consumo de combustível da sua moto.</p>
                        <CalculadoraConsumo />
                      </div>
                      {/* Ferramenta 3 */}
                      <div className="bg-gray/800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-6 h-6 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h2 className="text-lg font-semibold text-dark-800">Corridas FreeLancer</h2>
                        </div>
                        <p className="text-gray-600">Organize e planeje suas corridas futuras.</p>
                        <Freelas />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fim Ferramentas */}
              <Motivation className="mt-8" />
            </div>
          </main>
        </AuthGuard>
      </AuthProvider>
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
    </motion.div>
  );
}
