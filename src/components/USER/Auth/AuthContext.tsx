// components/USER/Auth/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/db/firebaseServices';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean; // Adicionado estado de carregamento
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true, // Inicializado como true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Estado de carregamento

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Define loading como false quando o estado de autenticação é resolvido
      if (user) {
        console.log("AuthContext: User authenticated. UID:", user.uid);
        localStorage.setItem('uid', user.uid);
      } else {
        console.log("AuthContext: User is null.");
        localStorage.removeItem('uid');
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading, // Exponha o estado de carregamento
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
