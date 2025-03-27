"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WelcomeBanner from "@/components/WelcomeBanner";
import ContactStatus from "@/app/profile/components/client/ContactStatus";
import RouteCalculator from "@/app/profile/components/map/RouteCalculator";
import Testimonials from "@/app/profile/components/client/Testimonials";
import LatestDeliveries from "@/app/profile/components/client/LatestDeliveries";
import QRCodePage from "@/app/profile/components/client/QRCodePage";
import { getUserPublicData } from "@/lib/db/firebaseServices";

interface PublicUserData {
  name: string;
  profileImageUrl: string;
  isVerified: boolean;
  badges: string[];
  bloodType?: string;
  emergencyPhone?: string;
  contactEmail?: string;
  online?: boolean;
}

function mapPublicUserData(data: Record<string, any>): PublicUserData {
  return {
    name:
      data.nickname && data.nickname.trim() !== ""
        ? data.nickname
        : `${data.firstName} ${data.lastName}`.trim(),
    profileImageUrl: data.profileImageUrl,
    isVerified: data.isVerified ?? true,
    badges: data.badges ?? ["DogCrazy", "Líder entregas", "+1k entregas"],
    bloodType: data.bloodType,
    emergencyPhone: data.emergencyPhone,
    contactEmail: data.email,
    online: data.online ?? false,
  };
}

export default function PublicProfilePage() {
  const { id } = useParams();
  const [userData, setUserData] = useState<PublicUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const data = await getUserPublicData(id);
        console.log("Dados retornados:", data);
        if (data) {
          setUserData(mapPublicUserData(data));
        } else {
          setError("Nenhum dado encontrado para este usuário.");
        }
      } catch (err) {
        console.error("Erro ao buscar dados públicos:", err);
        setError("Erro ao buscar dados do usuário.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div>Carregando perfil...</div>;
  if (error) return <div>{error}</div>;
  if (!userData) return <div>Usuário não encontrado.</div>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Seção de boas-vindas */}
        <WelcomeBanner
          displayName={userData.name}
          profileImageUrl={userData.profileImageUrl}
          isVerified={userData.isVerified}
          badges={userData.badges}
          bloodType={userData.bloodType}
          emergencyPhone={userData.emergencyPhone}
          profileId={id}
        />
        {/* Seção de contato e status */}
        <ContactStatus
          contactEmail={userData.contactEmail || ""}
          online={userData.online}
        />
         <QRCodePage profileId={id} />
      </div>
      {/* Componente QRCodePage para gerar o QR Code com o link do perfil */}
     
      {/* Calculadora de Rotas */}
      <RouteCalculator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Depoimentos */}
        <Testimonials />
        {/* Últimas Entregas */}
        <LatestDeliveries />
      </div>
    </div>
  );
}
