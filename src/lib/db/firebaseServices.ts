import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
    Timestamp, // Import Timestamp here
} from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
  apiKey: "AIzaSyC9u70PEbq3rC4NDx57rR4A4IGPReY0TqY",
  authDomain: "diariomoto-8543b.firebaseapp.com",
  projectId: "diariomoto-8543b",
  storageBucket: "diariomoto-8543b.firebasestorage.app",
  messagingSenderId: "476460880603",
  appId: "1:476460880603:web:5ea74d97089e197c3e32fe",
  measurementId: "G-ZJZJ7X3MV0"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Interface para os dados de ganhos (Earnings)
interface Earning {
  id: string;
  amount: number;
  mileage: number;
  platform: string;
  tip?: number;
  description?: string;
  date: any; // Considere usar um tipo mais específico, como firebase.firestore.Timestamp
  hours: number;
}

// Função para adicionar um ganho
async function addEarning(userId: string, earning: any) {
  const userRef = doc(db, 'users', userId);
  const earningsRef = collection(userRef, 'earnings');
  await addDoc(earningsRef, earning);
}

// Função para obter os ganhos de um usuário
export async function getEarnings(userId: string, startDate: Date | null = null, endDate: Date | null = null): Promise<Earning[]> {
  console.log("getEarnings called with:", { userId, startDate, endDate });
  try {
    let earningsRef = collection(db, 'users', userId, 'earnings');
    let q: any = null;

    if (startDate && endDate) {
      // Convert Dates to Firestore Timestamps
      const startTimestamp = startDate ? Timestamp.fromDate(startDate) : null;
      const endTimestamp = endDate ? Timestamp.fromDate(endDate) : null;

      // Adjust end date to include the entire day
      if (endTimestamp) {
        endTimestamp.seconds += 86399; // Add 23:59:59 seconds to the end of the day
      }

      q = query(earningsRef, where('date', '>=', startTimestamp), where('date', '<', endTimestamp), orderBy('date', 'asc'));
    } else {
      q = query(earningsRef, orderBy('date', 'asc'));
    }

    const querySnapshot = await getDocs(q);
    console.log("getEarnings: querySnapshot size:", querySnapshot.size);
    const earnings: Earning[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("getEarnings: Document data:", data);
      earnings.push({ id: doc.id, ...data, date: data.date.toDate() } as Earning); // Convert timestamp to Date
    });
    console.log("getEarnings: Returning earnings:", earnings);
    return earnings;
  } catch (error) {
    console.error("Erro ao obter ganhos:", error);
    throw error;
  }
}

// Função para deletar um ganho
export async function deleteEarning(userId: string, earningId: string) {
  try {
      const earningRef = doc(db, 'users', userId, 'earnings', earningId);
      await deleteDoc(earningRef);
      console.log(`Earning with ID ${earningId} deleted successfully.`);
  } catch (error) {
      console.error("Erro ao deletar ganho:", error);
      throw error;
  }
}

// Função para adicionar uma manutenção
async function adicionarManutencao(userId: string, manutencao: any) {
  const userRef = doc(db, 'users', userId);
  const manutencoesRef = collection(userRef, 'manutencoes');
  await addDoc(manutencoesRef, manutencao);
}

// Função para obter as manutenções de um usuário
async function obterManutencoes(userId: string) {
  const userRef = doc(db, 'users', userId);
  const manutencoesRef = collection(userRef, 'manutencoes');
  const q = query(manutencoesRef, orderBy('data', 'desc'));
  const querySnapshot = await getDocs(q);
  const manutencoes = [];
  querySnapshot.forEach((doc) => {
    manutencoes.push({ id: doc.id, ...doc.data() });
  });
  return manutencoes;
}

// Função para registrar os dados da moto
async function registerBike(userId: string, bikeData: any) {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { bike: bikeData }, { merge: true });
}

// Função para obter os dados da moto de um usuário
async function getBikeData(userId: string) {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data().bike || null;
  } else {
    return null;
  }
}

// Função para obter os dados da moto de um usuário (duplicada, remover uma)
async function obterDadosMoto(userId: string) {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data().moto || null;
  } else {
    return null;
  }
}

// Função para adicionar um abastecimento
async function addFueling(userId: string, fuelingData: any) {
  try {
    const fuelingRef = await addDoc(collection(db, 'users', userId, 'abastecimentos'), fuelingData);
    return fuelingRef.id;
  } catch (error) {
    console.error("Erro ao adicionar abastecimento:", error);
    throw error;
  }
}

// Função para obter os abastecimentos de um usuário
async function getFuelings(userId: string, startDate: Date | null = null, endDate: Date | null = null) {
  try {
    let q = collection(db, 'users', userId, 'abastecimentos');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      q = query(q, where('data', '>=', start), where('data', '<=', end), orderBy('data', 'desc'));
    } else {
      q = query(q, orderBy('data', 'desc'));
    }
    const querySnapshot = await getDocs(q);
    const fuelings = [];
    querySnapshot.forEach((doc) => {
      fuelings.push({ id: doc.id, ...doc.data() });
    });
    return fuelings;
  } catch (error) {
    console.error("Erro ao obter abastecimentos:", error);
    throw error;
  }
}

// Função para salvar as configurações do usuário
async function saveUserConfig(userId: string, configData: any) {
  const userRef = doc(db, 'users', userId);
  await setDoc(doc(userRef, 'configurations', 'user'), configData, { merge: true });
}

// Função para salvar as configurações de ganhos do usuário
async function saveEarningsConfig(userId: string, configData: any) {
  const userRef = doc(db, 'users', userId);
  await setDoc(doc(userRef, 'configurations', 'earnings'), configData, { merge: true });
}

// Função para salvar as configurações do aplicativo do usuário
async function saveAppConfig(userId: string, configData: any) {
  const userRef = doc(db, 'users', userId);
  await setDoc(doc(userRef, 'configurations', 'app'), configData, { merge: true });
}

// Função para obter as configurações do usuário
async function getUserConfig(userId: string) {
  const userRef = doc(db, 'users', userId);
  const configRef = doc(userRef, 'configurations', 'user');
  const docSnap = await getDoc(configRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}

// Função para obter as configurações de ganhos do usuário
async function getEarningsConfig(userId: string) {
  const userRef = doc(db, 'users', userId);
  const configRef = doc(userRef, 'configurations', 'earnings');
  const docSnap = await getDoc(configRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}

// Função para obter as configurações do aplicativo do usuário
async function getAppConfig(userId: string) {
  const userRef = doc(db, 'users', userId);
  const configRef = doc(userRef, 'configurations', 'app');
  const docSnap = await getDoc(configRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}

// Função para fazer logout
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Exporta as funções e variáveis necessárias
export { 
  app,
  db, 
  auth, 
  collection, 
  addDoc, 
  getDocs, 
  addEarning, 
  deleteEarning,
  getEarnings, 
  registerBike, 
  getBikeData,
  obterDadosMoto, // Remova se não for usar, já que é duplicada
  addFueling,
  getFuelings,
  saveUserConfig,
  saveEarningsConfig,
  saveAppConfig,
  getUserConfig,
  getEarningsConfig,
  getAppConfig,
  adicionarManutencao, // Adicionado
  obterManutencoes // Adicionado
};
