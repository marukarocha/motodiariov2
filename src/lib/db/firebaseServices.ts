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
  Timestamp, // Importa Timestamp
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
interface Earning {
  id: string;
  amount: number;
  mileage: number;
  platform: string;
  tip?: number;
  description?: string;
  date: any; // Pode ser Timestamp ou Date; convertendo para Date ao ler
  hours: number;
}

// Função para adicionar um ganho
async function addEarning(userId: string, earning: any) {
  const userRef = doc(db, "users", userId);
  const earningsRef = collection(userRef, "earnings");
  await addDoc(earningsRef, earning);
}

// Função para obter os ganhos de um usuário com filtro de datas
export async function getEarnings(
  userId: string,
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<Earning[]> {
  console.log("getEarnings called with:", { userId, startDate, endDate });
  try {
    let earningsRef = collection(db, "users", userId, "earnings");
    let q: any = null;

    if (startDate && endDate) {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      // Ajusta o endTimestamp para incluir o dia inteiro (adiciona 23h59m59s)
      const adjustedEndTimestamp = new Timestamp(
        endTimestamp.seconds + 86399,
        endTimestamp.nanoseconds
      );
      q = query(
        earningsRef,
        where("date", ">=", startTimestamp),
        where("date", "<", adjustedEndTimestamp),
        orderBy("date", "asc")
      );
    } else {
      q = query(earningsRef, orderBy("date", "asc"));
    }

    const querySnapshot = await getDocs(q);
    console.log("getEarnings: querySnapshot size:", querySnapshot.size);
    const earnings: Earning[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      console.log("getEarnings: Document data:", data);
      earnings.push({
        id: docSnap.id,
        ...data,
        date: data.date.toDate(), // Converte Timestamp para Date
      } as Earning);
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
    const earningRef = doc(db, "users", userId, "earnings", earningId);
    await deleteDoc(earningRef);
    console.log(`Earning with ID ${earningId} deleted successfully.`);
  } catch (error) {
    console.error("Erro ao deletar ganho:", error);
    throw error;
  }
}

/* =======================
   FUNÇÕES PARA MANUTENÇÕES
   ======================= */

// Função para adicionar uma manutenção
async function adicionarManutencao(userId: string, manutencao: any) {
  const userRef = doc(db, "users", userId);
  const manutencoesRef = collection(userRef, "manutencoes");
  await addDoc(manutencoesRef, manutencao);
}

// Função para obter as manutenções de um usuário
async function obterManutencoes(userId: string) {
  const userRef = doc(db, "users", userId);
  const manutencoesRef = collection(userRef, "manutencoes");
  const q = query(manutencoesRef, orderBy("data", "desc"));
  const querySnapshot = await getDocs(q);
  const manutencoes = [];
  querySnapshot.forEach((docSnap) => {
    manutencoes.push({ id: docSnap.id, ...docSnap.data() });
  });
  return manutencoes;
}

/* =======================
   FUNÇÕES PARA A MOTO
   ======================= */

// Função para registrar os dados da moto
async function registerBike(userId: string, bikeData: any) {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { bike: bikeData }, { merge: true });
}

// Função para obter os dados da moto de um usuário
async function getBikeData(userId: string) {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data().bike || null;
  } else {
    return null;
  }
}

// Função para obter os dados da moto (duplicada, se não usar, remover)
async function obterDadosMoto(userId: string) {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data().moto || null;
  } else {
    return null;
  }
}



/* =======================
   FUNÇÕES PARA Manutenção
   ======================= */

   
// Interface (opcional) para Manutenção
export interface Manutencao {
  id: string;
  tipo: string;
  data: string;
  hora: string;
  km: number;
  valor: number;
  local: string;
  observacoes?: string;
}

/**
 * Registra uma nova manutenção para o usuário.
 * @param {string} userId - ID do usuário.
 * @param {Object} manutencaoData - Dados da manutenção.
 * Exemplo:
 * {
 *   tipo: "troca de óleo",
 *   data: "01/03/2025",
 *   hora: "09:30",
 *   km: 5000,
 *   valor: 150,
 *   local: "Posto X",
 *   observacoes: "Troca com filtro novo"
 * }
 */
export async function addManutencao(userId, manutencaoData) {
  try {
    const manutencoesRef = collection(doc(db, "users", userId), "manutencoes");
    const docRef = await addDoc(manutencoesRef, manutencaoData);
    console.log("Manutenção registrada com sucesso!");
    return docRef.id;
  } catch (error) {
    console.error("Erro ao registrar manutenção:", error);
    throw error;
  }
}

/**
 * Obtém as manutenções do usuário, ordenadas pela data (mais recentes primeiro).
 * @param {string} userId - ID do usuário.
 * @returns {Promise<Manutencao[]>} - Array de manutenções.
 */
export async function getManutencoes(userId) {
  try {
    const manutencoesRef = collection(doc(db, "users", userId), "manutencoes");
    const q = query(manutencoesRef, orderBy("data", "desc"));
    const querySnapshot = await getDocs(q);
    const manutencoes = [];
    querySnapshot.forEach((docSnap) => {
      manutencoes.push({ id: docSnap.id, ...docSnap.data() });
    });
    return manutencoes;
  } catch (error) {
    console.error("Erro ao buscar manutenções:", error);
    throw error;
  }
}

/**
 * Deleta uma manutenção.
 * @param {string} userId - ID do usuário.
 * @param {string} manutencaoId - ID da manutenção a ser deletada.
 */
export async function deleteManutencao(userId, manutencaoId) {
  try {
    const manutencaoRef = doc(db, "users", userId, "manutencoes", manutencaoId);
    await deleteDoc(manutencaoRef);
    console.log(`Manutenção com ID ${manutencaoId} deletada com sucesso.`);
  } catch (error) {
    console.error("Erro ao deletar manutenção:", error);
    throw error;
  }
}
/* =======================
   FIM FUNÇÕES PARA Manutenção
   ======================= */





/* =======================
   FUNÇÕES PARA ABASTECIMENTOS
   ======================= */

/**
 * Interface para o abastecimento (combustível)
 * Campos:
 *  - data: string (formato "dd/mm/aaaa")
 *  - hora: string (ex: "14:30")
 *  - litros: number
 *  - posto: string
 *  - valorLitro: number
 */
export interface Combustivel {
  id: string;
  data: string;
  hora: string;
  litros: number;
  posto: string;
  valorLitro: number;
}

/**
 * Registra um novo abastecimento.
 * @param {string} userId - ID do usuário.
 * @param {Object} fuelingData - Objeto contendo os dados do abastecimento.
 * Exemplo:
 * {
 *   data: new Date().toLocaleDateString("pt-BR"),
 *   hora: "14:30",
 *   litros: 15.5,
 *   posto: "Posto X",
 *   valorLitro: 3.99
 * }
 * @returns {Promise<string>} - Retorna o ID do documento registrado.
 */
export async function addFueling(userId, fuelingData) {
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

/**
 * Obtém os abastecimentos de um usuário.
 * Se filterDate for informado, espera um objeto Date e converte para string no formato "pt-BR"
 * para filtrar os documentos cujo campo "data" esteja dentro desse dia.
 * @param {string} userId - ID do usuário.
 * @param {Date|null} filterDate - Data para filtrar os abastecimentos (opcional).
 * @returns {Promise<Combustivel[]>} - Retorna um array de abastecimentos.
 */
export async function getFuelings(userId, filterDate = null) {
  try {
    let colRef = collection(db, "users", userId, "abastecimentos");
    let q;

    if (filterDate) {
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Converter as datas para o mesmo formato utilizado no registro
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
    const fuelings = [];
    querySnapshot.forEach((docSnap) => {
      fuelings.push({ id: docSnap.id, ...docSnap.data() });
    });
    return fuelings;
  } catch (error) {
    console.error("Erro ao buscar abastecimentos:", error);
    throw error;
  }
}

/**
 * Deleta um abastecimento.
 * @param {string} userId - ID do usuário.
 * @param {string} fuelingId - ID do abastecimento a ser deletado.
 */
export async function deleteFueling(userId, fuelingId) {
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
async function saveUserConfig(userId: string, configData: any) {
  const userRef = doc(db, "users", userId);
  await setDoc(doc(userRef, "configurations", "user"), configData, { merge: true });
}

// Função para salvar as configurações de ganhos do usuário
async function saveEarningsConfig(userId: string, configData: any) {
  const userRef = doc(db, "users", userId);
  await setDoc(doc(userRef, "configurations", "earnings"), configData, { merge: true });
}

// Função para salvar as configurações do aplicativo do usuário
async function saveAppConfig(userId: string, configData: any) {
  const userRef = doc(db, "users", userId);
  await setDoc(doc(userRef, "configurations", "app"), configData, { merge: true });
}

// Função para obter as configurações do usuário
async function getUserConfig(userId: string) {
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
async function getEarningsConfig(userId: string) {
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
async function getAppConfig(userId: string) {
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
  addEarning,
  deleteEarning,
  getEarnings,
  registerBike,
  getBikeData,
  obterDadosMoto, // Remova se não for necessário
  addFueling,
  getFuelings,
  saveUserConfig,
  saveEarningsConfig,
  saveAppConfig,
  getUserConfig,
  getEarningsConfig,
  getAppConfig,
  adicionarManutencao,
  obterManutencoes,
};
