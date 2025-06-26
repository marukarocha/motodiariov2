'use client';

import { useAuth } from '@/components/USER/Auth/AuthContext';
import { useState } from 'react';
import TrackingMap from './components/TrackingMap';

export default function GpsTrackingPage() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tz = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    return tz.split(' ')[0]; // YYYY-MM-DD
  });

  if (!userId) return <p>Usuário não autenticado</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Rastreamento Diário por GPS</h1>

      <div className="flex items-center gap-2">
        <label htmlFor="data">Selecionar data:</label>
        <input
          id="data"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      <TrackingMap userId={userId} date={selectedDate} />
    </div>
  );
}
