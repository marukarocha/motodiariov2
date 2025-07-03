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
  query as query_, 
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  limit,
  Timestamp,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";

// -----------------------------------------------------------------------------
// Configuração do Firebase
// -----------------------------------------------------------------------------

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// -----------------------------------------------------------------------------
// FUNÇÕES PARA EARNINGS
// -----------------------------------------------------------------------------

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
    if (startDate && endDate) {
      const start = new Date(startDate.getTime());
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate.getTime());
      end.setHours(23, 59, 59, 999);
      q = query(
        earningsRef,
        where("date", ">=", Timestamp.fromDate(start)),
        where("date", "<=", Timestamp.fromDate(end)),
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

export async function calculateTotalHours(
  userId: string,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<number> {
  try {
    const earningsRef = collection(db, "users", userId, "earnings");
    let q;
    if (startDate && endDate) {
      const start = new Date(startDate.getTime());
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate.getTime());
      end.setHours(23, 59, 59, 999);
      q = query(
        earningsRef,
        where("date", ">=", Timestamp.fromDate(start)),
        where("date", "<=", Timestamp.fromDate(end)),
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
  } catch (error) {
    console.error("Erro ao atualizar ganho:", error);
    throw error;
  }
}

export async function deleteEarning(userId: string, earningId: string): Promise<void> {
  try {
    const earningRef = doc(db, "users", userId, "earnings", earningId);
    await deleteDoc(earningRef);
  } catch (error) {
    console.error("Erro ao excluir ganho:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// FUNÇÕES PARA MAINTENANCE
// -----------------------------------------------------------------------------

export async function addMaintenance(userId: string, maintenanceData: Record<string, unknown>): Promise<string> {
  const userRef = doc(db, "users", userId);
  const maintenanceRef = collection(userRef, "manutencoes");
  const docRef = await addDoc(maintenanceRef, maintenanceData);
  return docRef.id;
}

export async function getMaintenance(userId: string): Promise<Record<string, unknown>[]> {
  const userRef = doc(db, "users", userId);
  const maintenanceRef = collection(userRef, "manutencoes");
  const q = query(maintenanceRef, orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);
  const maintenance: Record<string, unknown>[] = [];
  querySnapshot.forEach((docSnap) => {
    maintenance.push({ id: docSnap.id, ...docSnap.data() });
  });
  return maintenance;
}

export async function updateMaintenance(
  userId: string,
  maintenanceId: string,
  updatedData: { [key: string]: any }
): Promise<void> {
  try {
    const maintenanceRef = doc(db, "users", userId, "manutencoes", maintenanceId);
    await updateDoc(maintenanceRef, updatedData);
  } catch (error) {
    console.error("Erro ao atualizar manutenção:", error);
    throw error;
  }
}

export async function deleteMaintenance(userId: string, maintenanceId: string): Promise<void> {
  try {
    const maintenanceRef = doc(db, "users", userId, "manutencoes", maintenanceId);
    await deleteDoc(maintenanceRef);
  } catch (error) {
    console.error("Erro ao deletar maintenance:", error);
    throw error;
  }
}
// Última manutenção do tipo "Troca de Óleo"
export async function getLastOilChange(uid: string) {
  const q = query(
    collection(db, `users/${uid}/manutencoes`), // << CORRIGIDO AQUI
    orderBy("timestamp", "desc"),
    limit(20)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log("📦 Registros encontrados:", docs.map(d => d.tipo));

    const oilEntry = docs.find(
      (doc) =>
        typeof doc.tipo === "string" &&
        doc.tipo.toLowerCase().includes("óleo")
    );

    console.log("🔧 Última troca de óleo encontrada:", oilEntry);
    return oilEntry || null;
  }

  return null;
}


export async function getCurrentOdometer(uid: string) {
  const q = query(
    collection(db, `users/${uid}/odometerRecords`), // <- CORRIGIDO AQUI
    orderBy("recordedAt", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0].data();
    console.log("📍 Último odômetro encontrado:", doc);
    return doc;
  }

  console.warn("📭 Nenhum registro de odômetro encontrado.");
  return null;
}
// -----------------------------------------------------------------------------
// FUNÇÕES PARA BIKE
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// FUNÇÕES PARA ABASTECIMENTOS
// -----------------------------------------------------------------------------

export interface Combustivel {
  id: string;
  date: Timestamp;       // data do abastecimento
  litros: number;        // litros abastecidos
  posto: string;         // nome do posto
  valorLitro: number;    // preço por litro
  currentMileage: number;// odômetro no momento
  fullTank: boolean;     // marcou como tanque cheio
}

/**
 * Busca os abastecimentos de um usuário, opcionalmente filtrando por período.
 */
export async function getFuelings(
  userId: string,
  fromDate: Date | null = null,
  toDate: Date | null = null
): Promise<Combustivel[]> {
  const colRef = collection(db, "users", userId, "abastecimentos");
  let q;
  if (fromDate && toDate) {
    const startTs = Timestamp.fromDate(new Date(fromDate).setHours(0, 0, 0, 0) as any);
    const endTs = Timestamp.fromDate(new Date(toDate).setHours(23, 59, 59, 999) as any);
    q = query(
      colRef,
      where("date", ">=", startTs),
      where("date", "<=", endTs),
      orderBy("date", "desc")
    );
  } else {
    q = query(colRef, orderBy("date", "desc"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const d = docSnap.data() as any;
    return {
      id: docSnap.id,
      date: d.date,
      litros: d.litros,
      posto: d.posto,
      valorLitro: d.valorLitro,
      currentMileage: d.currentMileage,
      fullTank: d.fullTank === true,
    };
  });
}

/**
 * Adiciona um novo abastecimento, garantindo que fullTank esteja definido.
 */
export async function addFueling(
  userId: string,
  fuelingData: {
    date: Timestamp;
    litros: number;
    posto: string;
    valorLitro: number;
    currentMileage: number;
    fullTank?: boolean;
  }
): Promise<string> {
  const fuelingsRef = collection(db, "users", userId, "abastecimentos");
  const payload = {
    ...fuelingData,
    fullTank: fuelingData.fullTank === true,
  };
  const docRef = await addDoc(fuelingsRef, payload);
  return docRef.id;
}

/**
 * Atualiza um abastecimento, incluindo o campo fullTank.
 */
export async function updateFueling(
  userId: string,
  fuelingId: string,
  updateData: Partial<{
    date: Timestamp;
    litros: number;
    posto: string;
    valorLitro: number;
    currentMileage: number;
    fullTank: boolean;
  }>
): Promise<void> {
  const fuelingRef = doc(db, "users", userId, "abastecimentos", fuelingId);
  await updateDoc(fuelingRef, {
    ...updateData,
    fullTank: updateData.fullTank === true || false,
  });
}

/**
 * Remove um abastecimento existente.
 */
export async function deleteFueling(
  userId: string,
  fuelingId: string
): Promise<void> {
  const fuelingRef = doc(db, "users", userId, "abastecimentos", fuelingId);
  await deleteDoc(fuelingRef);
}

// -----------------------------------------------------------------------------
// FUNÇÕES PARA ODOMETER RECORDS
// -----------------------------------------------------------------------------

export interface OdometerRecord {
  id: string;
  currentMileage: number;
  recordedAt: Date;
  note?: string;
  source: "fueling" | "earnings" | "maintenance" | "manual";
  sourceId?: string;
}

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
  const odometerRef = collection(db, "users", userId, "odometerRecords");
  const newRecord = {
    ...recordData,
    recordedAt: recordData.recordedAt
      ? Timestamp.fromDate(recordData.recordedAt)
      : Timestamp.fromDate(new Date()),
  };
  const docRef = await addDoc(odometerRef, newRecord);
  return docRef.id;
}

export async function getLastOdometerRecord(
  userId: string
): Promise<OdometerRecord | null> {
  const odometerRef = collection(db, "users", userId, "odometerRecords");
  const q = query(odometerRef, orderBy("recordedAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const d = docSnap.data() as any;
  return {
    id: docSnap.id,
    currentMileage: d.currentMileage,
    recordedAt: d.recordedAt.toDate(),
    note: d.note,
    source: d.source,
    sourceId: d.sourceId,
  };
}

export async function updateOdometerRecord(
  userId: string,
  recordId: string,
  updateData: Partial<{
    currentMileage: number;
    note?: string;
    source?: "fueling" | "earnings" | "maintenance" | "manual";
    sourceId?: string;
  }>
): Promise<void> {
  const recordRef = doc(db, "users", userId, "odometerRecords", recordId);
  await updateDoc(recordRef, updateData);
}
// Atualize as funções getOdometerRecords e deleteOdometerRecord para usar a mesma coleção

/**
 * Busca registros de odômetro do usuário
 * @param userId ID do usuário
 * @param date Data opcional para filtrar registros
 * @returns Array de registros de odômetro
 */
export const getOdometerRecords = async (userId: string, date: Date | null = null): Promise<any[]> => {
  try {
    let q;
    const odometerRef = collection(db, "users", userId, "odometerRecords");
    
    // Se uma data for fornecida, filtra por registros a partir dessa data
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      q = query_(odometerRef, 
        where('recordedAt', '>=', Timestamp.fromDate(startOfDay)),
        where('recordedAt', '<=', Timestamp.fromDate(endOfDay))
      );
    } else {
      q = query_(odometerRef, orderBy('recordedAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      recordedAt: doc.data().recordedAt // Mantém o Timestamp para compatibilidade
    }));
  } catch (error) {
    console.error('Erro ao buscar registros de odômetro:', error);
    throw error;
  }
};

/**
 * Exclui um registro de odômetro
 * @param userId ID do usuário
 * @param recordId ID do registro a ser excluído
 */
export const deleteOdometerRecord = async (userId: string, recordId: string): Promise<void> => {
  try {
    const recordRef = doc(db, "users", userId, "odometerRecords", recordId);
    await deleteDoc(recordRef);
  } catch (error) {
    console.error('Erro ao excluir registro de odômetro:', error);
    throw error;
  }
};

// -----------------------------------------------------------------------------
// FUNÇÕES PARA CONFIGURAÇÕES
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// FUNÇÕES PARA USUÁRIO
// -----------------------------------------------------------------------------

export async function updateUserData(userId: string, data: Partial<{ name: string; bikeModel: string }>): Promise<void> {
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

// -----------------------------------------------------------------------------
// FUNÇÕES PARA LOGOUT
// -----------------------------------------------------------------------------

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao realizar logout:", error);
    throw error;
  }
}


// configurações publicas de perfil de usuario: 



export async function getUserPublicData(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const userRef = doc(db, "users", userId);
    const profileRef = doc(userRef, "configurations", "user");
    const docSnap = await getDoc(profileRef);
    console.log("Dados públicos retornados:", docSnap.data());
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Erro ao buscar dados públicos:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// FUNÇÕES PARA PEDIDOS DE CORRIDA (Rider Requests)
// -----------------------------------------------------------------------------

export interface RiderRequest {
  client: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  origin: {
    address: string;
    coordinates: [number, number];
  };
  destination: {
    address: string;
    coordinates: [number, number];
  };
  route: {
    distance: number;  // em km
    cost: number;      // em R$
    duration: number;  // em minutos
    geometry: any;     // GeoJSON (opcional)
  };
  rideType: "Entrega" | "Passageiro" | "Compra";
  weightCategory: "Até 5 kg" | "5 a 15 kg" | "15 a 30 kg";
  status: "pendente" | "em andamento" | "finalizado";
  createdAt?: any;
}

export async function addRiderRequest(userId: string, request: RiderRequest): Promise<string> {
  try {
    const userRef = doc(db, "users", userId);
    const myRidersRef = collection(userRef, "myRiders");
    const docRef = await addDoc(myRidersRef, {
      ...request,
      createdAt: Timestamp.fromDate(new Date()),
    });
    console.log("Pedido salvo com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar pedido de corrida:", error);
    throw error;
  }
}
