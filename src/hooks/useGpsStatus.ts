import { useEffect, useState } from 'react';
import { db } from '@/lib/db/firebaseServices';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function useGpsStatus(userId: string) {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    const ref = collection(db, 'users', userId, 'gpsLogs');
    const q = query(ref, orderBy('createdAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0];
      if (doc) {
        const data = doc.data();
        const created = data.createdAt?.toDate();

        setPosition({ lat: data.latitude, lon: data.longitude });
        setLastUpdate(created);

        if (created && Date.now() - created.getTime() < 1000 * 60 * 2) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } else {
        setStatus('offline');
        setLastUpdate(null);
        setPosition(null);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return { status, lastUpdate, position };
}
