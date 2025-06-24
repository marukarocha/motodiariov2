import { useEffect, useState } from 'react';
import { db } from '@/lib/db/firebaseServices';
import {
  collectionGroup,
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

    // Busca nos registros do usuário dentro de todas as datas (subcoleções)
    const q = query(
      collectionGroup(db, userId), // busca em users/{userId}/gpsLogs/{date}/{time}
      orderBy('createdAt', 'desc'),
      limit(1)
    );

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
          setStatus(Date.now() - created.getTime() < 1000 * 60 * 2 ? 'online' : 'offline');
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
