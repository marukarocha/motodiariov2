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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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

// Função para obter os ganhos de um usuário com filtro de datas// Função para obter os ganhos de um usuário com filtro de datas
// Função para obter os ganhos de um usuário com filtro de datas
export async function getEarnings(
  userId: string,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<Earning[]> {
  try {
    const earningsRef = collection(db, "users", userId, "earnings");
    let q;

    if (startDate != null && endDate != null) {
      console.log(
        `🔎 Filtrando ganhos entre ${startDate} e ${endDate}`
      );

      // Cria cópias das datas para não modificar os objetos originais
      const start = new Date(startDate.getTime());
      start.setHours(0, 0, 0, 0);
      const startTimestamp = Timestamp.fromDate(start);

      const end = new Date(endDate.getTime());
      end.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(end);

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
        date: (data.date as Timestamp).toDate(), // Converte Timestamp para Date
      } as Earning);
    });

    console.log("📊 Ganhos filtrados retornados do Firestore:", earnings);
    return earnings;
  } catch (error) {
    console.error("❌ Erro ao obter ganhos:", error);
    throw error;
  }
}

// Função para calcular as horas totais dentro de um intervalo de datas
export async function calculateTotalHours(
  userId: string,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<number> {
  try {
    const earningsRef = collection(db, "users", userId, "earnings");
    let q;

    if (startDate != null && endDate != null) {
      // Cria cópias das datas para não alterar os objetos originais
      const start = new Date(startDate.getTime());
      start.setHours(0, 0, 0, 0);
      const startTimestamp = Timestamp.fromDate(start);

      const end = new Date(endDate.getTime());
      end.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(end);

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
    let totalHours = 0;

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.hours) {
        totalHours += Number(data.hours);
      }
    });

    console.log(`✅ Total de horas trabalhadas no período: ${totalHours}`);
    return totalHours;
  } catch (error) {
    console.error("Erro ao calcular total de horas:", error);
    return 0;
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
   FUNÇÕES PARA BIKE
   ======================= */

// Função para registrar os dados da moto
async function registerBike(userId: string, bikeData: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  // Salva os dados da moto no subdocumento "configurations/bike"
  const bikeDocRef = doc(userRef, "configurations", "bike");
  await setDoc(bikeDocRef, bikeData, { merge: true });
}

// Função para obter os dados da moto de um usuário
async function getBikeData(userId: string): Promise<Record<string, unknown> | null> {
  const userRef = doc(db, "users", userId);
  // Busca o subdocumento "configurations/bike"
  const bikeDocRef = doc(userRef, "configurations", "bike");
  const docSnap = await getDoc(bikeDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as Record<string, unknown>;
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
   FUNÇÃO Dados Usuaario
   ======================= */

   export async function updateUserData(userId: string, data: Partial<{ name: string; bikeModel: string }>) {
    if (!userId) throw new Error("ID do usuário é necessário");
  
    const userRef = doc(db, "users", userId);
  
    try {
      await updateDoc(userRef, data);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  }

  
// Função para buscar os dados do perfil do usuário
export async function getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const userRef = doc(db, "users", userId);
    const profileRef = doc(userRef, "configurations", "user");
    const docSnap = await getDoc(profileRef);
    console.log("Document snapshot in getUserProfile:", docSnap.data());
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    throw error;
  }
}

// Função para atualizar (ou criar) os dados do perfil do usuário
export async function updateUserProfile(userId: string, data: Record<string, unknown>): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const profileRef = doc(userRef, "configurations", "user");
    await setDoc(profileRef, data, { merge: true });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
}


/* =======================
   FUNÇÃO Calculo de horas 
   ======================= */
// Função para calcular as horas totais dentro de um intervalo de datas

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
