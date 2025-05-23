"use client";

import React, { useState } from "react";
import Person from "./person";
import PlatformUser from "./platformUser"; // componente de seleção de plataformas
import CardForm from "./components/client/Card"; // componente que gera o PDF com o QR Code
import { User, Smartphone, Settings, CreditCard } from "lucide-react";

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState("perfil");

  return (
    <div className="container mx-auto p-4">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar: no mobile, exibida acima do conteúdo */}
          <aside className="w-full md:w-1/4 mb-4 md:mb-0 mr-0 md:mr-4 border shadow-md rounded-lg p-4">
            <nav className="flex flex-col space-y-2">
              <button
                className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-700 ${
                  selectedTab === "perfil" ? "bg-gray-700" : ""
                }`}
                onClick={() => setSelectedTab("perfil")}
              >
                <User className="mr-2" />
                <span>Meu Perfil</span>
              </button>
              <button
                className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-700 ${
                  selectedTab === "aplicativos" ? "bg-gray-700" : ""
                }`}
                onClick={() => setSelectedTab("aplicativos")}
              >
                <Smartphone className="mr-2" />
                <span>Aplicativos</span>
              </button>
              <button
                className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-700 ${
                  selectedTab === "conta" ? "bg-gray-700" : ""
                }`}
                onClick={() => setSelectedTab("conta")}
              >
                <Settings className="mr-2" />
                <span>Conta</span>
              </button>
              <button
                className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-700 ${
                  selectedTab === "cartao" ? "bg-gray-700" : ""
                }`}
                onClick={() => setSelectedTab("cartao")}
              >
                <CreditCard className="mr-2" />
                <span>Cartão</span>
              </button>
            </nav>
          </aside>
          {/* Área de conteúdo */}
          <main className="flex-1 border shadow-md rounded-lg p-4">
            {selectedTab === "perfil" && <Person />}
            {selectedTab === "aplicativos" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Aplicativos</h2>
                <p className="mb-4">
                  Escolha as plataformas que você deseja utilizar:
                </p>
                <PlatformUser />
              </div>
            )}
            {selectedTab === "conta" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Conta</h2>
                <p>Aqui o usuário poderá alterar a senha e o nome de usuário.</p>
              </div>
            )}
            {selectedTab === "cartao" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Cartão de Visita</h2>
                {/* Passe os dados do usuário conforme necessário */}
                 <CardForm  />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
