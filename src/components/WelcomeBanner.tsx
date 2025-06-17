// components/WelcomeBanner.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Heart, CheckCircle } from "lucide-react";
import UserRoleBadge from "@/app/profile/components/UserroleBadge";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Área de boas-vindas */}
      <div className="md:col-span-2 flex items-center space-x-4">
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

      {/* Card de emergência */}
      <div className="flex items-center justify-center p-4 border border-red-500 rounded-lg">
        <div className="flex items-center space-x-3">
          <Heart className="h-8 w-8 text-red-500" />
          <div className="text-sm">
            <p>
              <strong>Tipo Sanguíneo:</strong>{" "}
              {bloodType || "Não cadastrado"}
            </p>
            <p>
              <strong>Tel. Emergência:</strong>{" "}
              {emergencyPhone || "Não cadastrado"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
