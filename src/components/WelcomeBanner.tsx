'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Heart, CheckCircle, XCircle, MapPin, Clock } from "lucide-react";
import UserRoleBadge from "@/app/profile/components/UserroleBadge";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { SimpleMapModal } from "@/components/GPS/MapBoxModal";
import { useGpsStatus } from "@/hooks/useGpsStatus";
import TestMap from '@/components/GPS/TesteMap';

interface WelcomeBannerProps {
  displayName: string;
  profileImageUrl: string;
  bloodType?: string;
  emergencyPhone?: string;
  isVerified?: boolean;
  badges?: string[];
  role?: string;
  profileId?: string;
}

export default function WelcomeBanner({
  displayName,
  profileImageUrl,
  bloodType,
  emergencyPhone,
  isVerified = true,
  badges = [],
  role = "user",
  profileId,
}: WelcomeBannerProps) {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || profileId || '';
  const { status, lastUpdate, position } = useGpsStatus(userId);
  const [showMap, setShowMap] = useState(false); // ⬅️ controle do modal

  return (
    <div className="full-width-container">
      <div className="w-full">  
        {/* <TestMap /> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Área de boas-vindas */}
        <div className="md:col-span-6 flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
            <img
              src={profileImageUrl}
              alt="Avatar"
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {displayName}
              {isVerified && (
                <CheckCircle className="h-5 w-5 text-blue-500" title="Verificado" />
              )}
            </h1>

            <div className="flex flex-wrap gap-2 mt-1 items-center">
              <UserRoleBadge role={role} />
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className="bg-gray-800 text-xs text-white rounded-full px-2 py-1"
                >
                  {badge}
                </span>
              ))}
            </div>

            <p className="text-muted-foreground mt-2">
              Bem-vindo de volta! Acompanhe as últimas informações do seu dia.
            </p>

            {profileId && (
              <Link
                href={`/profile/${profileId}`}
                className="mt-2 inline-block text-blue-500 hover:underline text-sm"
              >
                Ver Perfil Público
              </Link>
            )}
          </div>
        </div>

        {/* Status do GPS */}
        <div className="md:col-span-3 flex flex-col justify-between p-4 border border-blue-500 rounded-lg text-sm">
          <div>
            <p className="font-medium mb-1">Status do GPS:</p>
            <div className={`flex items-center gap-2 ${status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
              {status === 'online' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {status === 'online' ? 'Ativo' : 'Inativo'}
            </div>

            {position && (
              <>
                <div className="text-gray-700 flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {position.lat.toFixed(5)}, {position.lon.toFixed(5)}
                </div>
                <button
                  onClick={() => setShowMap(true)}
                  className="text-blue-500 underline text-sm mt-1"
                >
                  Ver no Mapa
                </button>
              </>
            )}

            {lastUpdate && (
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4" />
                {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Card de emergência */}
        <div className="md:col-span-3 flex items-center justify-center p-4 border border-red-500 rounded-lg">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <div className="text-sm">
              <p><strong>Tipo Sanguíneo:</strong> {bloodType || "Não cadastrado"}</p>
              <p><strong>Tel. Emergência:</strong> {emergencyPhone || "Não cadastrado"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do mapa */}
      {showMap && position && (
        <SimpleMapModal
          lat={position.lat}
          lon={position.lon}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
