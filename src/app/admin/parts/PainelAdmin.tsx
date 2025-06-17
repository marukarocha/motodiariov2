"use client";

import React, { useState } from "react";
import ListUsers from "./listUsers";
import ListPlatforms from "./listPlatforms";
import ListMotos from "./listMotos";
import ListManutencao from "./listMaitenance";
import { FaMotorcycle } from "react-icons/fa6";
import { User, Settings } from "lucide-react";
import { BsTools } from "react-icons/bs";
import { MdOutlineAppSettingsAlt } from "react-icons/md";
import { FaUsersCog } from "react-icons/fa";


export default function PainelAdmin() {
  const [selectedMenu, setSelectedMenu] = useState("users");

  const menuItems = [
    { key: "users", label: "Usuários", icon: <FaUsersCog size={20} className="mr-2" /> },
    { key: "platforms", label: "Plataformas", icon: <MdOutlineAppSettingsAlt size={20} className="mr-2" /> },
    { key: "motos", label: "Motos", icon: <FaMotorcycle  size={20} className="mr-2" /> },
    { key: "manutencao", label: "Manutenção", icon: <BsTools  size={20} className="mr-2" /> },
    { key: "settings", label: "Configurações", icon: <Settings size={20} className="mr-2" /> },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case "users": return <ListUsers />;
      case "platforms": return <ListPlatforms />;
      case "motos": return <ListMotos />;
      case "manutencao": return <ListManutencao />;
      case "settings":
        return (
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
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
      <aside className="w-72 p-6 border-r border-gray-700 bg-gray-900 shadow-lg">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-blue-400">Painel Admin</h2>
          <div className="h-1 w-16 bg-blue-500 mt-2 rounded-full"></div>
        </div>
        <nav>
          <ul className="space-y-2">
            {menuItems.map(({ key, label, icon }) => (
              <li key={key}>
                <button
                  onClick={() => setSelectedMenu(key)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 ${
                    selectedMenu === key ? "bg-gray-800 text-blue-400 font-medium shadow-md" : ""
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
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
        {renderContent()}
        </div>
      </main>
    </div>
  );
}
