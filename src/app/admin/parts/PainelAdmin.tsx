'use client';

import React, { useState } from 'react';
import ListUsers from './listUsers';
import ListPlatforms from './listPlatforms';
import ListMotos from './listMotos';
import ListManutencao from './listMaitenance';
import { FaMotorcycle } from 'react-icons/fa6';
import { Settings, User as LucideUser } from 'lucide-react';
import { BsTools } from 'react-icons/bs';
import { MdOutlineAppSettingsAlt } from 'react-icons/md';
import { FaUsersCog } from 'react-icons/fa';

export default function PainelAdmin() {
  const [selectedMenu, setSelectedMenu] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { key: 'users', label: 'Usuários', icon: <FaUsersCog size={20} className="mr-2" /> },
    { key: 'platforms', label: 'Plataformas', icon: <MdOutlineAppSettingsAlt size={20} className="mr-2" /> },
    { key: 'motos', label: 'Motos', icon: <FaMotorcycle size={20} className="mr-2" /> },
    { key: 'manutencao', label: 'Manutenção', icon: <BsTools size={20} className="mr-2" /> },
    { key: 'settings', label: 'Configurações', icon: <Settings size={20} className="mr-2" /> },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'users': return <ListUsers />;
      case 'platforms': return <ListPlatforms />;
      case 'motos': return <ListMotos />;
      case 'manutencao': return <ListManutencao />;
      case 'settings':
        return (
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Configurações</h1>
            <p>Aqui você poderá gerenciar as configurações do sistema.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Mobile nav & overlay */}
      <div className="md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 focus:outline-none"
          aria-label="Toggle menu"
        >
          {/* Simple hamburger icon */}
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-gray-400" />
            <span className="block w-6 h-0.5 bg-gray-400" />
            <span className="block w-6 h-0.5 bg-gray-400" />
          </div>
        </button>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 transform bg-gray-900 border-r border-gray-700 p-6 shadow-lg transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:block md:w-72
        `}
      >
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-blue-400">Painel Admin</h2>
          <div className="h-1 w-16 bg-blue-500 mt-2 rounded-full" />
        </div>
        <nav>
          <ul className="space-y-2">
            {menuItems.map(({ key, label, icon }) => (
              <li key={key}>
                <button
                  onClick={() => {
                    setSelectedMenu(key);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200
                    ${selectedMenu === key ? 'bg-gray-800 text-blue-400 font-medium shadow-md' : ''}
                  `}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto md:ml-72">
        {renderContent()}
      </main>
    </div>
  );
}

