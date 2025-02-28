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
  firstName: string;
  lastName: string;
  nickname: string;
  useNickname: boolean;
  bloodType: string;
  emergencyPhone: string;
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
          const userConfig = await getUserConfig(uid);
          if (userConfig) {
            setDashboardData(prev => ({
              ...prev,
              userData: {
                uid,
                email: userConfig.email ? String(userConfig.email) : null,
                firstName: userConfig.firstName ? String(userConfig.firstName) : "",
                lastName: userConfig.lastName ? String(userConfig.lastName) : "",
                nickname: userConfig.nickname ? String(userConfig.nickname) : "",
                useNickname: Boolean(userConfig.useNickname),
                bloodType: userConfig.bloodType ? String(userConfig.bloodType) : "",
                emergencyPhone: userConfig.emergencyPhone ? String(userConfig.emergencyPhone) : "",
                role: userConfig.role ? String(userConfig.role) : "user",
              },
            }));
          } else {
            console.log("User config not found for UID:", uid);
            setDashboardData(prev => ({
              ...prev,
              userData: null,
            }));
          }
        } catch (error: any) {
          console.error("Erro ao carregar dados do usuário:", error);
          setDashboardData(prev => ({
            ...prev,
            error: `Erro ao carregar dados do usuário: ${error.message}`,
          }));
        }
      } else {
        console.log("UID não encontrado no localStorage.");
      }
    };

    const fetchEarningsData = async () => {
      if (uid) {
        try {
          const earnings = await getEarnings(uid);
          setDashboardData(prev => ({
            ...prev,
            earnings: earnings as Earning[],
          }));
        } catch (error: any) {
          setDashboardData(prev => ({
            ...prev,
            error: `Erro ao carregar ganhos: ${error.message}`,
          }));
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
