import { useEffect, useState } from 'react';
import { db } from '@/lib/db/firebaseServices';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';

export function useGpsStatus(userId: string) {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Data de hoje no formato correto (fuso de São Paulo)
    const today = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).split(' ')[0]; // YYYY-MM-DD

    // Acessa: users/{userId}/gpsLogs/{YYYY-MM-DD}/{hhmmss}
    const gpsLogsTodayRef = collection(db, 'users', userId, 'gpsLogs', today, today);

    const q = query(gpsLogsTodayRef, orderBy('createdAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0];
      if (doc) {
        const data = doc.data();
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);
        const created = data.createdAt?.toDate();

        if (!isNaN(lat) && !isNaN(lon) && created) {
          setPosition({ lat, lon });
          setLastUpdate(created);
          const isRecent = Date.now() - created.getTime() < 1000 * 60 * 2;
          setStatus(isRecent ? 'online' : 'offline');
        } else {
          setPosition(null);
          setStatus('offline');
        }
      } else {
        setPosition(null);
        setStatus('offline');
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return { status, lastUpdate, position };
}
