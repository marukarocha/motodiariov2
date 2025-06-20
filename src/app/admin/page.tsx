'use client';

import React, { useState } from 'react';
import { FaUsersCog, FaMotorcycle } from 'react-icons/fa';
import { MdOutlineAppSettingsAlt } from 'react-icons/md';
import { BsTools } from 'react-icons/bs';
import { HiOutlineViewGrid } from 'react-icons/hi';
import ListUsers from './parts/listUsers';
import ListPlatforms from './parts/listPlatforms';
import ListMotos from './parts/listMotos';
import ListMaitenance from './parts/listMaitenance';
import ListTips from './parts/ListTips';
import { AuthGuard } from '@/components/USER/Auth/authGuard';
import AdminDashboard from './components/AdminDashboard';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <HiOutlineViewGrid size={20} /> },
  { key: 'users', label: 'Usuários', icon: <FaUsersCog size={20} /> },
  { key: 'platforms', label: 'Plataformas', icon: <MdOutlineAppSettingsAlt size={20} /> },
  { key: 'motos', label: 'Motos', icon: <FaMotorcycle size={20} /> },
  { key: 'manutencao', label: 'Manutenção', icon: <BsTools size={20} /> },
  { key: 'tips', label: 'Dicas Manuais', icon: <BsTools size={20} /> },

  
];

export default function PainelAdmin() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <ListUsers />;
      case 'platforms':
        return <ListPlatforms />;
      case 'motos':
        return <ListMotos />;
      case 'manutencao':
        return <ListMaitenance />;
      case 'tips':
        return <ListTips />;
      default:
        return null;
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-950 text-white relative">
        {/* Mobile Hamburger */}
        <button
          className="md:hidden fixed top-4 left-4 z-40 bg-gray-900 p-2 rounded-lg shadow"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-gray-400"></span>
            <span className="block w-6 h-0.5 bg-gray-400"></span>
            <span className="block w-6 h-0.5 bg-gray-400"></span>
          </div>
        </button>

        {/* Sidebar e overlay */}
        {sidebarOpen && (
          <div>
            {/* Overlay escuro */}
            <div
              className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar Off-canvas mobile */}
            <aside
              className={`
                fixed top-0 left-0 z-40 h-full w-64 bg-gray-900 border-r border-gray-700 p-6
                transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:relative md:translate-x-0 md:w-72 md:block
              `}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400">Painel Admin</h2>
                <button
                  className="md:hidden p-2 rounded"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Fechar menu"
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>
              <nav>
                <ul className="space-y-4">
                  {menuItems.map(({ key, label, icon }) => (
                    <li key={key}>
                      <button
                        onClick={() => {
                          setActiveMenu(key);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
                          activeMenu === key ? 'bg-gray-800 text-blue-400 font-semibold' : ''
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
          </div>
        )}

        {/* Sidebar fixa no desktop */}
        <aside className="hidden md:block md:w-72 bg-gray-900 p-6 border-r border-gray-700">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Painel Admin</h2>
          <nav>
            <ul className="space-y-4">
              {menuItems.map(({ key, label, icon }) => (
                <li key={key}>
                  <button
                    onClick={() => setActiveMenu(key)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
                      activeMenu === key ? 'bg-gray-800 text-blue-400 font-semibold' : ''
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

        {/* Conteúdo */}
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>
    </AuthGuard>
  );
}
