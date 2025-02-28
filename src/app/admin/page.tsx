"use client";

import React, { useState } from "react";
import ListUsers from "./parts/listUsers";
import ListPlatforms from "./parts/listPlatforms";
import ListMotos from "./parts/listMotos";
import ListManutencao from "./parts/listManutencao";
import { User, Settings } from "lucide-react";

export default function AdminUsersPage() {
  const [selectedMenu, setSelectedMenu] = useState("users");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 p-4 border-r">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Painel Admin</h2>
        </div>
        <nav>
          <ul>
            <li>
              <button
                onClick={() => setSelectedMenu("users")}
                className={`flex items-center w-full px-4 py-2 hover:bg-gray-700 ${
                  selectedMenu === "users" ? "bg-gray-700" : ""
                }`}
              >
                <User className="mr-2" />
                <span>Usuários</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu("platforms")}
                className={`flex items-center w-full px-4 py-2 hover:bg-gray-700 ${
                  selectedMenu === "platforms" ? "bg-gray-700" : ""
                }`}
              >
                <span className="mr-2">🔗</span>
                <span>Plataformas</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu("motos")}
                className={`flex items-center w-full px-4 py-2 hover:bg-gray-700 ${
                  selectedMenu === "motos" ? "bg-gray-700" : ""
                }`}
              >
                <span className="mr-2">🏍️</span>
                <span>Motos</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu("manutencao")}
                className={`flex items-center w-full px-4 py-2 hover:bg-gray-700 ${
                  selectedMenu === "manutencao" ? "bg-gray-700" : ""
                }`}
              >
                <span className="mr-2">🛠️</span>
                <span>Manutenção</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu("settings")}
                className={`flex items-center w-full px-4 py-2 hover:bg-gray-700 ${
                  selectedMenu === "settings" ? "bg-gray-700" : ""
                }`}
              >
                <Settings className="mr-2" />
                <span>Configurações</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      {/* Área de Conteúdo */}
      <main className="flex-1 p-4">
        {selectedMenu === "users" && <ListUsers />}
        {selectedMenu === "platforms" && <ListPlatforms />}
        {selectedMenu === "motos" && <ListMotos />}
        {selectedMenu === "manutencao" && <ListManutencao />}
        {selectedMenu === "settings" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Configurações</h1>
            <p>Aqui você poderá gerenciar as configurações do sistema.</p>
          </div>
        )}
      </main>
    </div>
  );
}
