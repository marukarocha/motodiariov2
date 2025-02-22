'use client';

import React, { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { app, db, auth } from '@/lib/db/firebaseServices'; // Importe app, db e auth

interface FirebaseContextProps {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextProps>({
  app: null,
  db: null,
  auth: null,
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // *Não inicialize o Firebase aqui*

  return (
    <FirebaseContext.Provider value={{ app, db, auth }}> {/* Use as instâncias importadas */}
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
