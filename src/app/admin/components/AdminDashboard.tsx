'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Stats {
  users: number;
  platforms: number;
  motos: number;
  maintenances: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    platforms: 0,
    motos: 0,
    maintenances: 0,
  });

  useEffect(() => {
    async function load() {
      const [u, p, m, mt] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/platforms').then(r => r.json()),
        fetch('/api/admin/motos').then(r => r.json()),
        fetch('/api/admin/maintenance/categories').then(r => r.json()),
      ]);
      // logs para debugar o retorno:
      console.log('API users', u);
      console.log('API platforms', p);
      console.log('API motos', m);
      console.log('API maintenance categories', mt);

      setStats({
        users: Array.isArray(u) ? u.length : (u?.users?.length || 0),
      platforms: Array.isArray(p) ? p.length : 0,   // <-- aqui conta as plataformas
        motos: Array.isArray(m) ? m.length : 0,
        maintenances: Array.isArray(mt) ? mt.length : 0,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-medium">Usuários</h2>
          <p className="text-2xl font-bold">{stats.users}</p>
        </Card>
        <Card className="p-4">
            <h2 className="text-lg font-medium">Plataformas</h2>
            <pre>{JSON.stringify(stats.platforms, null, 2)}</pre>
        </Card>
        <Card className="p-4">
          <h2 className="text-lg font-medium">Motos</h2>
          <p className="text-2xl font-bold">{stats.motos}</p>
        </Card>
        <Card className="p-4">
          <h2 className="text-lg font-medium">Categorias Manutenção</h2>
          <p className="text-2xl font-bold">{stats.maintenances}</p>
        </Card>
      </div>
    </div>
  );
}
