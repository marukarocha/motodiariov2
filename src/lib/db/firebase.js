// src/lib/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC9u70PEbq3rC4NDx57rR4A4IGPReY0TqY",
  authDomain: "diariomoto-8543b.firebaseapp.com",
  projectId: "diariomoto-8543b",
  storageBucket: "diariomoto-8543b.appspot.com", // Corrigido
  messagingSenderId: "476460880603",
  appId: "1:476460880603:web:5ea74d97089e197c3e32fe",
  measurementId: "G-ZJZJ7X3MV0"
};

// Inicialize o Firebase App apenas se ainda não estiver inicializado
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firestore e Auth
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Exporte tudo o que vai usar nos módulos
export { db, auth, collection, addDoc, getDocs };
