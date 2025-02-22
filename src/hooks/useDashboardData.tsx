// useDashboardData.tsx
'use client';

import { useState, useEffect } from 'react';
import { getEarnings, getUserConfig } from '@/lib/db/firebaseServices';

interface Earning {
    id: string;
    amount: number;
    mileage: number;
    platform: string;
    tip?: number;
    description?: string;
    date: any;
    hours?: number;
}

interface User {
    uid: string;
    email: string | null;
    name: string | null;
    role: string;
}

interface DashboardData {
  userData: User | null;
  earnings: Earning[] | null;
  error: string | null;
  loading: boolean;
}

export const useDashboardData = (): DashboardData => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    userData: null,
    earnings: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const uid = localStorage.getItem('uid');

    const fetchUserData = async () => {
      if (uid) {
        try {
          console.log("fetchUserData: UID from localStorage:", uid);
          const userConfig = await getUserConfig(uid);
          if (userConfig) {
            setDashboardData(prev => ({
              ...prev,
              userData: {
                uid,
                email: userConfig.email || null,
                name: userConfig.name || 'N/A',
                role: userConfig.role || 'user',
              },
            }));
          } else {
            console.log("fetchUserData: User config not found for UID:", uid);
            setDashboardData(prev => ({ ...prev, error: 'Dados do usuário não encontrados.' }));
          }
        } catch (error: any) {
          console.error("fetchUserData: Error:", error);
          setDashboardData(prev => ({ ...prev, error: `Erro ao carregar dados do usuário: ${error.message}` }));
        }
      } else {
        console.log("fetchUserData: UID not found in localStorage.");
      }
    };

    const fetchEarningsData = async () => {
      if (uid) {
        try {
          console.log("fetchEarningsData: fetching earnings for UID:", uid);
          const userEarnings = await getEarnings(uid);
          setDashboardData(prev => ({ ...prev, earnings: userEarnings as Earning[] }));
        } catch (error: any) {
          setDashboardData(prev => ({ ...prev, error: `Erro ao carregar ganhos: ${error.message}` }));
        }
      }
    };

    const fetchData = async () => {
      setDashboardData(prev => ({ ...prev, loading: true }));
      await fetchUserData();
      await fetchEarningsData();
      setDashboardData(prev => ({ ...prev, loading: false }));
    };

    fetchData();
  }, []);

  return dashboardData;
};
