'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, loading } = useAuth(); // Obtenha o estado de carregamento
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      // Redireciona para a página de login se não estiver autenticado e o carregamento estiver concluído
      console.log("AuthGuard: Redirecionando para /login");
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return <div>Carregando...</div>; // Ou um componente de loading mais sofisticado
  }

  // Se chegou até aqui, o usuário está autenticado ou o carregamento ainda está em andamento
  return <>{children}</>;
}
