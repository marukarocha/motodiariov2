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
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";

// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
  apiKey: "AIzaSyC9u70PEbq3rC4NDx57rR4A4IGPReY0TqY",
  authDomain: "diariomoto-8543b.firebaseapp.com",
  projectId: "diariomoto-8543b",
  storageBucket: "diariomoto-8543b.firebasestorage.app",
  messagingSenderId: "476460880603",
  appId: "1:476460880603:web:5ea74d97089e197c3e32fe",
  measurementId: "G-ZJZJ7X3MV0",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


/* =======================
   FUNÇÕES PARA EARNINGS
   ======================= */

// Interface para os dados de ganhos (Earnings)
export interface Earning {
  id: string;
  amount: number;
  mileage: number;
  platform: string;
  tip?: number;
  description?: string;
  date: Date; // Convertido para Date na leitura
  hours: number;
}

// Função para adicionar um ganho
export async function addEarning(userId: string, earning: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  const earningsRef = collection(userRef, "earnings");
  await addDoc(earningsRef, earning);
}

// Função para obter os ganhos de um usuário com filtro de datas
export async function getEarnings(userId: string, startDate: Date | null = null, endDate: Date | null = null): Promise<Earning[]> {
  try {
    let earningsRef = collection(db, "users", userId, "earnings");
    let q;

    if (startDate && endDate) {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      q = query(
        earningsRef,
        where("date", ">=", startTimestamp),
        where("date", "<=", endTimestamp),
        orderBy("date", "desc")
      );
    } else {
      q = query(earningsRef, orderBy("date", "desc"));
    }

    const querySnapshot = await getDocs(q);
    const earnings: Earning[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      earnings.push({
        id: docSnap.id,
        ...data,
        date: (data.date as Timestamp).toDate(),
      } as Earning);
    });

    return earnings;
  } catch (error) {
    console.error("Erro ao obter ganhos:", error);
    throw error;
  }
}
// 📌 Atualiza um registro de ganho no Firestore
export async function updateEarning(userId: string, earningId: string, updatedData: Partial<Earning>) {
  try {
    const earningRef = doc(db, "users", userId, "earnings", earningId);
    const docSnap = await getDoc(earningRef);

    if (!docSnap.exists()) {
      throw new Error(`Nenhum documento encontrado para o ID: ${earningId}`);
    }

    await updateDoc(earningRef, updatedData);
    console.log("Ganho atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar ganho:", error);
    throw error;
  }
}


// 📌 Deleta um registro de ganho no Firestore
export async function deleteEarning(userId: string, earningId: string) {
  try {
    const earningRef = doc(db, "users", userId, "earnings", earningId);
    await deleteDoc(earningRef);
    console.log("Ganho deletado com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir ganho:", error);
    throw error;
  }
}



/* =======================
   FUNÇÕES PARA MAINTENANCE
   ======================= */

// Função para adicionar uma maintenance
async function addMaintenance(userId: string, maintenanceData: Record<string, unknown>): Promise<string> {
  const userRef = doc(db, "users", userId);
  const maintenanceRef = collection(userRef, "manutencoes"); // Mantém a subcoleção com o nome "manutencoes" no Firebase
  const docRef = await addDoc(maintenanceRef, maintenanceData);
  console.log("Maintenance registered successfully!");
  return docRef.id;
}

// Função para obter as maintenance de um usuário
async function getMaintenance(userId: string): Promise<Record<string, unknown>[]> {
  const userRef = doc(db, "users", userId);
  const maintenanceRef = collection(userRef, "manutencoes");
  const q = query(maintenanceRef, orderBy("data", "desc"));
  const querySnapshot = await getDocs(q);
  const maintenance: Record<string, unknown>[] = [];
  querySnapshot.forEach((docSnap) => {
    maintenance.push({ id: docSnap.id, ...docSnap.data() });
  });
  return maintenance;
}

// Função para deletar uma maintenance
async function deleteMaintenance(userId: string, maintenanceId: string): Promise<void> {
  try {
    const maintenanceRef = doc(db, "users", userId, "manutencoes", maintenanceId);
    await deleteDoc(maintenanceRef);
    console.log(`Maintenance with ID ${maintenanceId} deleted successfully.`);
  } catch (error) {
    console.error("Erro ao deletar maintenance:", error);
    throw error;
  }
}

/* =======================
   FUNÇÕES PARA A MOTO
   ======================= */

// Função para registrar os dados da moto
async function registerBike(userId: string, bikeData: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { bike: bikeData }, { merge: true });
}

// Função para obter os dados da moto de um usuário
async function getBikeData(userId: string): Promise<Record<string, unknown> | null> {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return (docSnap.data().bike as Record<string, unknown>) || null;
  } else {
    return null;
  }
}

/* =======================
   FUNÇÕES PARA ABASTECIMENTOS
   ======================= */

// Interface para o abastecimento (combustível)
export interface Combustivel {
  id: string;
  data: string;      // formato "dd/mm/aaaa"
  hora: string;      // ex: "14:30"
  litros: number;
  posto: string;
  valorLitro: number;
}

// Função para adicionar um abastecimento
async function addFueling(userId: string, fuelingData: Record<string, unknown>): Promise<string> {
  try {
    const fuelingsRef = collection(db, "users", userId, "abastecimentos");
    const docRef = await addDoc(fuelingsRef, fuelingData);
    console.log("Abastecimento registrado com sucesso!");
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar abastecimento:", error);
    throw error;
  }
}

// Função para obter os abastecimentos de um usuário
async function getFuelings(userId: string, filterDate: Date | null = null): Promise<Combustivel[]> {
  try {
    let colRef = collection(db, "users", userId, "abastecimentos");
    let q;
    if (filterDate) {
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);

      const startStr = startOfDay.toLocaleDateString("pt-BR");
      const endStr = endOfDay.toLocaleDateString("pt-BR");

      q = query(
        colRef,
        where("data", ">=", startStr),
        where("data", "<=", endStr),
        orderBy("data", "desc")
      );
    } else {
      q = query(colRef, orderBy("data", "desc"));
    }

    const querySnapshot = await getDocs(q);
    const fuelings: Combustivel[] = [];
    querySnapshot.forEach((docSnap) => {
      fuelings.push({ id: docSnap.id, ...docSnap.data() } as Combustivel);
    });
    return fuelings;
  } catch (error) {
    console.error("Erro ao buscar abastecimentos:", error);
    throw error;
  }
}

// Função para deletar um abastecimento
async function deleteFueling(userId: string, fuelingId: string): Promise<void> {
  try {
    const fuelingRef = doc(db, "users", userId, "abastecimentos", fuelingId);
    await deleteDoc(fuelingRef);
    console.log(`Abastecimento com ID ${fuelingId} deletado com sucesso.`);
  } catch (error) {
    console.error("Erro ao deletar abastecimento:", error);
    throw error;
  }
}

/* =======================
   FUNÇÕES PARA CONFIGURAÇÕES
   ======================= */

// Função para salvar as configurações do usuário
async function saveUserConfig(userId: string, configData: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(doc(userRef, "configurations", "user"), configData, { merge: true });
}

// Função para salvar as configurações de ganhos do usuário
async function saveEarningsConfig(userId: string, configData: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(doc(userRef, "configurations", "earnings"), configData, { merge: true });
}

// Função para salvar as configurações do aplicativo do usuário
async function saveAppConfig(userId: string, configData: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(doc(userRef, "configurations", "app"), configData, { merge: true });
}

// Função para obter as configurações do usuário
async function getUserConfig(userId: string): Promise<Record<string, unknown> | null> {
  const userRef = doc(db, "users", userId);
  const configRef = doc(userRef, "configurations", "user");
  const docSnap = await getDoc(configRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}

// Função para obter as configurações de ganhos do usuário
async function getEarningsConfig(userId: string): Promise<Record<string, unknown> | null> {
  const userRef = doc(db, "users", userId);
  const configRef = doc(userRef, "configurations", "earnings");
  const docSnap = await getDoc(configRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}

// Função para obter as configurações do aplicativo do usuário
async function getAppConfig(userId: string): Promise<Record<string, unknown> | null> {
  const userRef = doc(db, "users", userId);
  const configRef = doc(userRef, "configurations", "app");
  const docSnap = await getDoc(configRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}

/* =======================
   FUNÇÃO PARA LOGOUT
   ======================= */

async function logout(): Promise<void> {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

/* =======================
   EXPORTAÇÕES
   ======================= */

export {
  app,
  db,
  auth,
  collection,
  addDoc,
  getDocs,

  registerBike,
  getBikeData,
  addFueling,
  getFuelings,
  saveUserConfig,
  saveEarningsConfig,
  saveAppConfig,
  getUserConfig,
  getEarningsConfig,
  getAppConfig,
  getMaintenance,
  addMaintenance,
  deleteMaintenance,
  deleteFueling,
  logout,
};
