import { getEarnings } from '@/lib/db/firebaseServices';

/* Calcula o total de ganhos somando amount e tip */
export const calculateTotalEarnings = async (uid: string): Promise<number> => {
  try {
    const earnings = await getEarnings(uid);
    console.log('calculateTotalEarnings: Dados de ganhos:', earnings);

    let total = 0;
    if (earnings && earnings.length > 0) {
      for (const earning of earnings) {
        let amount = 0;
        if (earning) {
          const amountValue = earning.amount ? Number(earning.amount) : 0;
          const tipValue = earning.tip ? Number(earning.tip) : 0;
          amount = amountValue + tipValue;
        }
        console.log('calculateTotalEarnings: Valor do ganho:', amount);
        total += isNaN(amount) ? 0 : amount;
      }
    }
    return total;
  } catch (error) {
    console.error('Erro ao calcular ganhos:', error);
    return 0;
  }
};

/* Função placeholder para calcular abastecimentos */
export const calculateTotalFuelings = async (uid: string): Promise<number> => {
  // Implemente a lógica para calcular o total de abastecimentos
  return 0;
};

/* Calcula o total de quilômetros */
export const calculateTotalKilometers = async (uid: string): Promise<number> => {
  try {
    const earnings = await getEarnings(uid);
    console.log('calculateTotalKilometers: Dados de ganhos:', earnings);

    let total = 0;
    if (earnings && earnings.length > 0) {
      for (const earning of earnings) {
        let mileage = 0;
        if (earning && earning.mileage) {
          mileage = Number(earning.mileage);
        }
        console.log('calculateTotalKilometers: Valor do km:', mileage);
        total += isNaN(mileage) ? 0 : mileage;
      }
      return total;
    }
    return 0;
  } catch (error) {
    console.error('Erro ao calcular quilômetros:', error);
    return 0;
  }
};

/* Calcula o total de horas convertendo o campo duration (minutos) para horas */
export const calculateTotalHours = async (
  uid: string,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<number> => {
  try {
    console.log(`🔄 Buscando total de horas para UID: ${uid} entre ${startDate} e ${endDate}`);

    const earnings = await getEarnings(uid, startDate, endDate);
    console.log("🔎 Ganhos filtrados recebidos para calcular horas:", earnings);

    let total = 0;
    earnings.forEach((earning) => {
      // Converte duration (minutos) para horas
      const minutes = earning.duration ? Number(earning.duration) : 0;
      const hours = minutes / 60;
      console.log(`⏳ Duration (minutos) para ${earning.date}: ${minutes} => ${hours} horas`);
      total += isNaN(hours) ? 0 : hours;
    });

    console.log(`✅ Total de horas trabalhadas no período: ${total}`);
    return total;
  } catch (error) {
    console.error("❌ Erro ao calcular total de horas:", error);
    return 0;
  }
};

/* Calcula a média de ganhos por hora */
export const calculateAverageEarningsPerHour = async (uid: string): Promise<number> => {
  try {
    const earnings = await getEarnings(uid);
    if (earnings && earnings.length > 0) {
      let totalEarnings = 0;
      let totalHours = 0;
      for (const earning of earnings) {
        const amount = earning.amount ? Number(earning.amount) : 0;
        const tip = earning.tip ? Number(earning.tip) : 0;
        // Converte duration (minutos) para horas
        const minutes = earning.duration ? Number(earning.duration) : 0;
        const hours = minutes / 60;
        totalEarnings += amount + tip;
        totalHours += hours;
      }
      return totalHours > 0 ? totalEarnings / totalHours : 0;
    }
    return 0;
  } catch (error) {
    console.error('Erro ao calcular média de ganhos por hora:', error);
    return 0;
  }
};

/* Calcula a média de ganhos por dia considerando somente os dias com registros (excluindo dias off) */
export const calculateAverageEarningsPerDay = async (uid: string): Promise<number> => {
  try {
    const earnings = await getEarnings(uid);
    if (earnings && earnings.length > 0) {
      let totalEarnings = 0;
      const uniqueDates = new Set<string>();
      for (const earning of earnings) {
        const amount = earning.amount ? Number(earning.amount) : 0;
        const tip = earning.tip ? Number(earning.tip) : 0;
        totalEarnings += amount + tip;
        if (earning.date) {
          const dateObj =
            earning.date && earning.date.seconds
              ? new Date(earning.date.seconds * 1000)
              : earning.date instanceof Date
              ? earning.date
              : new Date();
          uniqueDates.add(dateObj.toISOString().split("T")[0]);
        }
      }
      return uniqueDates.size > 0 ? totalEarnings / uniqueDates.size : 0;
    }
    return 0;
  } catch (error) {
    console.error('Erro ao calcular média de ganhos por dia:', error);
    return 0;
  }
};
