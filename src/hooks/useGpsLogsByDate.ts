import { useEffect, useState } from 'react';
import { db } from '@/lib/db/firebaseServices';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

interface GpsLog {
  latitude: number;
  longitude: number;
  speed: number;
  time: Date;
  context?: string;
}

export function useGpsLogsByDate(userId: string, date: string) {
  const [logs, setLogs] = useState<GpsLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !date) return;

    async function fetchLogs() {
      setLoading(true);
      const colRef = collection(db, 'users', userId, 'gpsLogs', date, date);
      const q = query(colRef, orderBy('time', 'asc'));
      const snapshot = await getDocs(q);

      const data: GpsLog[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          latitude: parseFloat(d.latitude),
          longitude: parseFloat(d.longitude),
          speed: parseFloat(d.speed),
          time: d.time?.toDate(),
          context: d.context || '',
        };
      });

      setLogs(data);
      setLoading(false);
    }

    fetchLogs();
  }, [userId, date]);

  return { logs, loading };
}
