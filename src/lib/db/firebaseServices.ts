// firebaseServices.ts

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
  updateDoc,
  limit,  // <-- importe limit aqui
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
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/* =======================
   FUNÇÕES PARA EARNINGS
   ======================= */

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

export async function addEarning(userId: string, earning: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  const earningsRef = collection(userRef, "earnings");
  await addDoc(earningsRef, earning);
}

export async function getEarnings(
  userId: string,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<Earning[]> {
  try {
    const earningsRef = collection(db, "users", userId, "earnings");
    let q;
    if (startDate != null && endDate != null) {
      console.log(`🔎 Filtrando ganhos entre ${startDate} e ${endDate}`);
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
        date: (data.date as Timestamp).toDate(),
      } as Earning);
    });
    console.log("📊 Ganhos retornados:", earnings);
    return earnings;
  } catch (error) {
    console.error("❌ Erro ao obter ganhos:", error);
    throw error;
  }
}

export async function calculateTotalHours(
  userId: string,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<number> {
  try {
    const earningsRef = collection(db, "users", userId, "earnings");
    let q;
    if (startDate != null && endDate != null) {
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
    console.log(`✅ Total de horas: ${totalHours}`);
    return totalHours;
  } catch (error) {
    console.error("Erro ao calcular horas:", error);
    return 0;
  }
}

export async function updateEarning(
  userId: string,
  earningId: string,
  updatedData: Partial<Earning>
): Promise<void> {
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

export async function deleteEarning(userId: string, earningId: string): Promise<void> {
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

   export async function addMaintenance(userId: string, maintenanceData: Record<string, unknown>): Promise<string> {
    const userRef = doc(db, "users", userId);
    const maintenanceRef = collection(userRef, "manutencoes");
    const docRef = await addDoc(maintenanceRef, maintenanceData);
    console.log("Maintenance registrado com sucesso!");
    return docRef.id;
  }
  
  export async function getMaintenance(userId: string): Promise<Record<string, unknown>[]> {
    const userRef = doc(db, "users", userId);
    const maintenanceRef = collection(userRef, "manutencoes");
    // Alterado: ordena pelo campo "timestamp" em vez de "data"
    const q = query(maintenanceRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const maintenance: Record<string, unknown>[] = [];
    querySnapshot.forEach((docSnap) => {
      maintenance.push({ id: docSnap.id, ...docSnap.data() });
    });
    return maintenance;
  }
  
  export async function deleteMaintenance(userId: string, maintenanceId: string): Promise<void> {
    try {
      const maintenanceRef = doc(db, "users", userId, "manutencoes", maintenanceId);
      await deleteDoc(maintenanceRef);
      console.log(`Maintenance com ID ${maintenanceId} deletado com sucesso.`);
    } catch (error) {
      console.error("Erro ao deletar maintenance:", error);
      throw error;
    }
  }
/* =======================
   FUNÇÕES PARA BIKE
   ======================= */

export async function registerBike(userId: string, bikeData: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  const bikeDocRef = doc(userRef, "configurations", "bike");
  await setDoc(bikeDocRef, bikeData, { merge: true });
}

export async function getBikeData(userId: string): Promise<Record<string, unknown> | null> {
  const userRef = doc(db, "users", userId);
  const bikeDocRef = doc(userRef, "configurations", "bike");
  const docSnap = await getDoc(bikeDocRef);
  return docSnap.exists() ? (docSnap.data() as Record<string, unknown>) : null;
}

/* =======================
   FUNÇÕES PARA ABASTECIMENTOS
   ======================= */

export interface Combustivel {
  id: string;
  data: string;      // formato "dd/mm/aaaa"
  hora: string;      // ex: "14:30"
  litros: number;
  posto: string;
  valorLitro: number;
}

export async function addFueling(userId: string, fuelingData: Record<string, unknown>): Promise<string> {
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

export async function getFuelings(userId: string, filterDate: Date | null = null): Promise<Combustivel[]> {
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

export async function deleteFueling(userId: string, fuelingId: string): Promise<void> {
  try {
    const fuelingRef = doc(db, "users", userId, "abastecimentos", fuelingId);
    await deleteDoc(fuelingRef);
    console.log(`Abastecimento com ID ${fuelingId} deletado com sucesso.`);
  } catch (error) {
    console.error("Erro ao deletar abastecimento:", error);
    throw error;
  }
}

export async function updateFueling(
  userId: string,
  fuelingId: string,
  fuelingData: Record<string, unknown>
): Promise<void> {
  try {
    const fuelingRef = doc(db, "users", userId, "abastecimentos", fuelingId);
    await updateDoc(fuelingRef, fuelingData);
    console.log("Abastecimento atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar abastecimento:", error);
    throw error;
  }
}

/* =======================
   FUNÇÕES PARA CONFIGURAÇÕES
   ======================= */

export async function saveUserConfig(userId: string, configData: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(doc(userRef, "configurations", "user"), configData, { merge: true });
}

export async function saveEarningsConfig(userId: string, configData: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(doc(userRef, "configurations", "earnings"), configData, { merge: true });
}

export async function saveAppConfig(userId: string, configData: Record<string, unknown>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(doc(userRef, "configurations", "app"), configData, { merge: true });
}

export async function getUserConfig(userId: string): Promise<Record<string, unknown> | null> {
  const userRef = doc(db, "users", userId);
  const configRef = doc(userRef, "configurations", "user");
  const docSnap = await getDoc(configRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export async function getEarningsConfig(userId: string): Promise<Record<string, unknown> | null> {
  const userRef = doc(db, "users", userId);
  const configRef = doc(userRef, "configurations", "earnings");
  const docSnap = await getDoc(configRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export async function getAppConfig(userId: string): Promise<Record<string, unknown> | null> {
  const userRef = doc(db, "users", userId);
  const configRef = doc(userRef, "configurations", "app");
  const docSnap = await getDoc(configRef);
  return docSnap.exists() ? docSnap.data() : null;
}

/* =======================
   FUNÇÕES PARA USUÁRIO
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

export async function getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const userRef = doc(db, "users", userId);
    const profileRef = doc(userRef, "configurations", "user");
    const docSnap = await getDoc(profileRef);
    console.log("Profile snapshot:", docSnap.data());
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    throw error;
  }
}

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
   FUNÇÕES PARA LOGOUT
   ======================= */

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Erro ao realizar logout:", error);
    throw error;
  }
}


/* =======================
   NOVAS FUNÇÕES PARA ODOMETER RECORDS
   ======================= */

/**
 * Interface para registro do odômetro.
 */
export interface OdometerRecord {
  id: string;
  currentMileage: number; // Valor atual do odômetro
  recordedAt: Date;       // Data e hora em que o registro foi salvo
  note?: string;          // Nota opcional para o registro
  source: "fueling" | "earnings" | "maintenance" | "manual"; // Origem do registro
  sourceId?: string;      // ID do documento associado, se aplicável
}

/**
 * Adiciona um novo registro de odômetro na subcoleção "odometerRecords" do usuário.
 * Se for enviado o campo recordedAt, ele será utilizado; caso contrário, será usado o timestamp atual.
 */
export async function addOdometerRecord(
  userId: string,
  recordData: { 
    currentMileage: number; 
    note?: string; 
    source: "fueling" | "earnings" | "maintenance" | "manual"; 
    sourceId?: string;
    recordedAt?: Date;
  }
): Promise<string> {
  const userRef = doc(db, "users", userId);
  const odometerRef = collection(userRef, "odometerRecords");
  const newRecord = {
    ...recordData,
    recordedAt: recordData.recordedAt 
      ? Timestamp.fromDate(recordData.recordedAt)
      : Timestamp.fromDate(new Date()),
  };
  const docRef = await addDoc(odometerRef, newRecord);
  console.log("Registro de odômetro adicionado com sucesso!", newRecord);
  return docRef.id;
}

/**
 * Busca o último registro de odômetro do usuário (mais recente).
 */
export async function getLastOdometerRecord(userId: string): Promise<OdometerRecord | null> {
  const userRef = doc(db, "users", userId);
  const odometerRef = collection(userRef, "odometerRecords");
  const q = query(odometerRef, orderBy("recordedAt", "desc"), limit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      currentMileage: data.currentMileage,
      recordedAt: (data.recordedAt as Timestamp).toDate(),
      note: data.note || "",
      source: data.source,
      sourceId: data.sourceId || "",
    };
  }
  return null;
}

/**
 * Busca todos os registros de odômetro do usuário, ordenados por data (mais recentes primeiro).
 */
export async function getOdometerRecords(userId: string): Promise<OdometerRecord[]> {
  const userRef = doc(db, "users", userId);
  const odometerRef = collection(userRef, "odometerRecords");
  const q = query(odometerRef, orderBy("recordedAt", "desc"));
  const querySnapshot = await getDocs(q);
  const records: OdometerRecord[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    records.push({
      id: docSnap.id,
      currentMileage: data.currentMileage,
      recordedAt: (data.recordedAt as Timestamp).toDate(),
      note: data.note || "",
      source: data.source,
      sourceId: data.sourceId || "",
    });
  });
  return records;
}

/**
 * Atualiza um registro específico do odômetro.
 */
export async function updateOdometerRecord(
  userId: string,
  recordId: string,
  updatedData: Partial<{ 
    currentMileage: number; 
    note?: string; 
    source?: "fueling" | "earnings" | "maintenance" | "manual"; 
    sourceId?: string;
  }>
): Promise<void> {
  const recordRef = doc(db, "users", userId, "odometerRecords", recordId);
  await updateDoc(recordRef, updatedData);
  console.log("Registro de odômetro atualizado com sucesso!");
}

/**
 * Exclui um registro de odômetro.
 */
export async function deleteOdometerRecord(
  userId: string,
  recordId: string
): Promise<void> {
  const recordRef = doc(db, "users", userId, "odometerRecords", recordId);
  await deleteDoc(recordRef);
  console.log("Registro de odômetro excluído com sucesso!");
}