// Arquivo: app/admin/page.tsx
"use client";

import React, { useState } from "react";
import ListUsers from "./parts/listUsers";
import ListPlatforms from "./parts/listPlatforms";
import ListMotos from "./parts/listMotos";
import ListManutencao from "./parts/listMaitenance";
import { User, Settings } from "lucide-react";

export default function AdminUsersPage() {
  const [selectedMenu, setSelectedMenu] = useState("users");

  const menuItems = [
    { key: "users", label: "Usuários", icon: <User className="mr-2" /> },
    { key: "platforms", label: "Plataformas", icon: <span className="mr-2">🔗</span> },
    { key: "motos", label: "Motos", icon: <span className="mr-2">🏍️</span> },
    { key: "manutencao", label: "Manutenção", icon: <span className="mr-2">🛠️</span> },
    { key: "settings", label: "Configurações", icon: <Settings className="mr-2" /> },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case "users": return <ListUsers />;
      case "platforms": return <ListPlatforms />;
      case "motos": return <ListMotos />;
      case "manutencao": return <ListManutencao />;
      case "settings": return (
        <div>
          <h1 className="text-2xl font-bold mb-4">Configurações</h1>
          <p>Aqui você poderá gerenciar as configurações do sistema.</p>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 p-4 border-r border-gray-700 bg-gray-900">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Painel Admin</h2>
        </div>
        <nav>
          <ul className="space-y-1">
            {menuItems.map(({ key, label, icon }) => (
              <li key={key}>
                <button
                  onClick={() => setSelectedMenu(key)}
                  className={`flex items-center w-full px-4 py-2 rounded hover:bg-gray-800 transition-all ${
                    selectedMenu === key ? "bg-gray-800" : ""
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Área de Conteúdo */}
      <main className="flex-1 p-4">
        {renderContent()}
      </main>
    </div>
  );
}
