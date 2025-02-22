'use client';

import { useEffect, useState } from 'react';
import { getEarnings, getUserConfig } from '@/lib/db/firebaseServices';

interface Earning {
    id: string;
    amount: number;
    mileage: number;
    platform: string;
    tip?: number;
    description?: string;
    date: any;
}

interface User {
    uid: string;
    email: string | null;
    name: string | null;
    role: string;
}

export default function UserPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uid = localStorage.getItem('uid');

    const fetchUserData = async () => {
      setIsLoading(true);
      if (uid) {
        try {
          console.log("fetchUserData: UID from localStorage:", uid);
          const userConfig = await getUserConfig(uid);
          if (userConfig) {
            setUserData({
              uid,
              email: userConfig.email || null,
              name: userConfig.name || 'N/A',
              role: userConfig.role || 'user',
            });
          } else {
            console.log("fetchUserData: User config not found for UID:", uid);
            setError('Dados do usuário não encontrados.');
          }
        } catch (error) {
          console.error("fetchUserData: Error:", error);
          setError(`Erro ao carregar dados do usuário: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("fetchUserData: UID not found in localStorage.");
        setIsLoading(false);
      }
    };

    const fetchEarningsData = async () => {
      if (uid) {
        try {
          console.log("fetchEarningsData: fetching earnings for UID:", uid);
          const userEarnings = await getEarnings(uid);
          setEarnings(userEarnings as Earning[]);
        } catch (error) {
          setError(`Erro ao carregar ganhos: ${error.message}`);
        }
      }
    };

    fetchUserData();
    fetchEarningsData();
  }, []);

  if (isLoading) {
    return <div>Carregando dados do usuário...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  if (!userData) {
    return <div>Nenhum dado de usuário encontrado.</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Perfil do Usuário</h1>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>UID:</strong> {userData.uid}</p>
      <p><strong>Nome:</strong> {userData.name}</p>
      <p><strong>Role:</strong> {userData.role}</p>

      <h2>Ganhos Recentes</h2>
      {earnings.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Valor</th>
              <th>KM</th>
              <th>Plataforma</th>
              <th>Gorjeta</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((earning) => (
              <tr key={earning.id}>
                <td>{earning.date?.toDate().toLocaleDateString() || 'N/A'}</td>
                <td>{earning.amount}</td>
                <td>{earning.mileage}</td>
                <td>{earning.platform}</td>
                <td>{earning.tip || 'N/A'}</td>
                <td>{earning.description || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum ganho registrado.</p>
      )}
    </div>
  );
}
