// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export { db, collection, addDoc, getDocs };

import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Importe o auth

const firebaseConfig = {
  // Suas configurações do Firebase
  apiKey: "AIzaSyC9u70PEbq3rC4NDx57rR4A4IGPReY0TqY",
  authDomain: "diariomoto-8543b.firebaseapp.com",
  projectId: "diariomoto-8543b",
  storageBucket: "diariomoto-8543b.firebasestorage.app",
  messagingSenderId: "476460880603",
  appId: "1:476460880603:web:5ea74d97089e197c3e32fe",
  measurementId: "G-ZJZJ7X3MV0"
};

// Inicialize o Firebase apenas uma vez
let firebaseApp;

if (!firebaseApp) {
  firebaseApp = initializeApp(firebaseConfig);
}

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp); // Inicialize o auth

export { db, auth }; // Exporte db e auth