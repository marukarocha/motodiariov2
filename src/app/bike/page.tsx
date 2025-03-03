'use client';

import React, { useState, useEffect } from "react";
import { FaMotorcycle, FaWrench, FaGasPump } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BikeCard } from "@/app/bike/components/BikeCard";
import { RegisterBikeForm } from "@/app/bike/register";
import MaintenancePage from "@/app/bike/maintenance";
import TankFuellPage from "@/app/bike/tankFuell";
import { getBikeData } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BikeData } from "@/app/bike/register"; // Interface BikeData

export default function BikePage() {
  const [selectedTab, setSelectedTab] = useState("info");
  const { currentUser } = useAuth();
  const [bikeData, setBikeData] = useState<BikeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchBikeData() {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const data = await getBikeData(currentUser.uid);
        console.log("Dados retornados do Firebase:", data);
        if (data) {
          const bike: BikeData = {
            make: data.make as string,
            model: data.model as string,
            year: Number(data.year),
            plate: data.plate as string,
            color: data.color as string,
            initialMileage: Number(data.initialMileage),
          };
          setBikeData(bike);
        } else {
          setBikeData(null);
        }
      } catch (err) {
        console.error("Erro ao buscar dados da moto:", err);
        toast({
          title: "Erro!",
          description: "Erro ao buscar dados da moto.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchBikeData();
  }, [currentUser]); // Removido "toast" das dependências

  return (
    <div className="container mx-auto p-4">
      {/* BikeCard fixo na parte superior */}
      <BikeCard bikeData={bikeData} isLoading={isLoading} />

      <div className="flex flex-col md:flex-row mt-4">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 mb-4 md:mb-0 mr-0 md:mr-4 border shadow-md rounded-lg p-4">
          <nav className="flex flex-col space-y-2">
            <button
              className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-700 ${
                selectedTab === "info" ? "bg-gray-700" : ""
              }`}
              onClick={() => setSelectedTab("info")}
            >
              <FaMotorcycle className="mr-2" />
              <span>Informações da Moto</span>
            </button>
            <button
              className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-700 ${
                selectedTab === "maintenance" ? "bg-gray-700" : ""
              }`}
              onClick={() => setSelectedTab("maintenance")}
            >
              <FaWrench className="mr-2" />
              <span>Manutenção</span>
            </button>
            <button
              className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-700 ${
                selectedTab === "fuel" ? "bg-gray-700" : ""
              }`}
              onClick={() => setSelectedTab("fuel")}
            >
              <FaGasPump className="mr-2" />
              <span>Abastecimento</span>
            </button>
          </nav>
        </aside>

        {/* Área de conteúdo */}
        <main className="flex-1 shadow-md rounded-lg p-4">
          {selectedTab === "info" && <RegisterBikeForm />}
          {selectedTab === "maintenance" && <MaintenancePage />}
          {selectedTab === "fuel" && <TankFuellPage />}

        </main>
      </div>
    </div>
  );
}
