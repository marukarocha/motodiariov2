import { useEffect, useState } from 'react';
import { db } from '@/lib/db/firebaseServices';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function useGpsStatus(userId: string) {
  const [gpsStatus, setGpsStatus] = useState<'offline' | 'online'>('offline');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'gpsLogs'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0];
      if (doc) {
        const data = doc.data();
        const now = Date.now();
        const last = data.createdAt?.toDate().getTime();

        setPosition({ lat: data.latitude, lon: data.longitude });
        setLastUpdate(new Date(last));

        if (now - last < 1000 * 60 * 2) {
          setGpsStatus('online');
        } else {
          setGpsStatus('offline');
        }
      } else {
        setGpsStatus('offline');
        setPosition(null);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return { gpsStatus, lastUpdate, position };
}
